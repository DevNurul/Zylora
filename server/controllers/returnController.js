const Order   = require('../models/Order')
const Return  = require('../models/Return')
const Product = require('../models/Product')
const { initiatePayment: phonePeInitiate } = require('../utils/phonePeService')
const { sendReturnConfirmationEmail } = require('../utils/emailService')

const RETURN_WINDOW_DAYS   = 3
const EXCHANGE_WINDOW_DAYS = 3

function daysSince(date) {
  return Math.floor((Date.now() - new Date(date)) / 86_400_000)
}

/* ── POST /api/returns ───────────────────────────────────────────────────────── */
exports.submitRequest = async (req, res) => {
  const {
    orderId, type, items, comment,
    exchangeType, newProduct: newProductData,
    refundMethod, bankDetails,
  } = req.body
  const user = req.user

  if (!orderId || !type || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'orderId, type, and at least one item are required' })
  }
  if (!['return', 'exchange'].includes(type)) {
    return res.status(400).json({ success: false, error: 'type must be return or exchange' })
  }

  const order = await Order.findOne({ orderId, email: user.email })
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' })

  if (order.status !== 'delivered') {
    return res.status(400).json({ success: false, error: 'Returns are only available for delivered orders' })
  }

  const deliveredEntry = order.statusHistory?.find(h => h.status === 'delivered')
  const deliveredAt    = deliveredEntry?.timestamp || order.createdAt
  const days           = daysSince(deliveredAt)

  const window = type === 'exchange' ? EXCHANGE_WINDOW_DAYS : RETURN_WINDOW_DAYS
  if (days > window) {
    return res.status(400).json({
      success: false,
      error: type === 'exchange'
        ? `Exchange window has expired. Exchanges are accepted within ${EXCHANGE_WINDOW_DAYS} days of delivery.`
        : `Return window has expired. Returns are accepted within ${RETURN_WINDOW_DAYS} days of delivery.`,
    })
  }

  // Check for existing return — allow resubmission after soft reject
  const existing = await Return.findOne({ orderId, customerEmail: user.email }).sort({ createdAt: -1 })
  let originalReturnId    = null
  let resubmissionCount   = 0

  if (existing) {
    if (existing.status !== 'rejected') {
      return res.status(400).json({ success: false, error: 'A return or exchange request already exists for this order.' })
    }
    if (existing.rejectionType === 'hard') {
      return res.status(400).json({
        success: false,
        error: 'Your previous request was permanently rejected and cannot be resubmitted.',
      })
    }
    if ((existing.resubmissionCount || 0) >= 1) {
      return res.status(400).json({
        success: false,
        error: 'You have already resubmitted once. No further resubmissions allowed.',
      })
    }
    originalReturnId  = existing.returnId
    resubmissionCount = (existing.resubmissionCount || 0) + 1
  }

  // Validate items & build request items
  const requestItems = []
  let   refundAmount  = 0

  for (const reqItem of items) {
    if (!reqItem.reason) {
      return res.status(400).json({ success: false, error: 'Each item must have a reason' })
    }

    const resolvedExchangeType = (type === 'exchange' ? (exchangeType || 'same_product') : null)

    if (type === 'exchange' && resolvedExchangeType === 'same_product' && !reqItem.exchangeSize) {
      return res.status(400).json({ success: false, error: 'Each exchange item must have an exchangeSize for same-product exchange' })
    }

    const orderItem = order.items.find(
      (i) => i.productId?.toString() === reqItem.productId?.toString() || i.name === reqItem.name
    )
    if (!orderItem) {
      return res.status(400).json({ success: false, error: `Item "${reqItem.name}" not found in order` })
    }

    // One-exchange-per-item enforcement
    if (type === 'exchange' && orderItem.exchangeUsed) {
      return res.status(400).json({
        success: false,
        error: `${orderItem.name} has already been exchanged once and cannot be exchanged again.`,
      })
    }

    const qty = reqItem.qty || orderItem.qty
    requestItems.push({
      productId:    orderItem.productId,
      name:         orderItem.name,
      image:        orderItem.image,
      price:        orderItem.price,
      orderedSize:  orderItem.size,
      orderedColor: orderItem.color,
      qty,
      reason:       reqItem.reason,
      exchangeSize: reqItem.exchangeSize || undefined,
    })
    refundAmount += orderItem.price * qty
  }

  // Refund method validation for return type
  if (type === 'return') {
    if (!refundMethod || !['bank_transfer', 'wallet'].includes(refundMethod)) {
      return res.status(400).json({ success: false, error: 'refundMethod is required (bank_transfer or wallet)' })
    }
    if (refundMethod === 'bank_transfer') {
      const { accountHolderName, accountNumber, ifscCode, bankName } = bankDetails || {}
      if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
        return res.status(400).json({ success: false, error: 'Bank details are required for bank_transfer refund' })
      }
    }
  }

  // Different-product exchange logic
  const resolvedExchangeType = type === 'exchange' ? (exchangeType || 'same_product') : 'same_product'
  let   priceDifference      = 0
  let   newProductRecord      = undefined
  let   pdpStatus            = 'not_required'

  if (type === 'exchange' && resolvedExchangeType === 'different_product') {
    if (!newProductData?.productId || !newProductData?.size) {
      return res.status(400).json({ success: false, error: 'newProduct.productId and size are required for different product exchange' })
    }

    const newProd = await Product.findById(newProductData.productId)
    if (!newProd) return res.status(400).json({ success: false, error: 'Selected product not found' })

    const sizeStockEntry = newProd.sizeStock?.get?.(newProductData.size) ?? (newProd.stock || 0)
    if (sizeStockEntry <= 0) {
      return res.status(400).json({ success: false, error: 'Selected product size is out of stock' })
    }

    newProductRecord = {
      productId: newProd._id,
      name:  newProd.name,
      image: newProd.images?.[0]?.url || '',
      price: newProd.price,
      size:  newProductData.size,
      color: newProductData.color || (newProd.colors?.[0] || ''),
    }

    priceDifference = newProd.price - refundAmount
    if (priceDifference > 0)       pdpStatus = 'pending'
    else if (priceDifference < 0 && refundMethod === null) {
      // customer needs to choose refund method
    }
  }

  // Refund method validation for exchange with price diff < 0
  if (type === 'exchange' && priceDifference < 0) {
    if (!refundMethod || !['bank_transfer', 'wallet'].includes(refundMethod)) {
      return res.status(400).json({ success: false, error: 'refundMethod is required when new product is cheaper' })
    }
    if (refundMethod === 'bank_transfer') {
      const { accountHolderName, accountNumber, ifscCode, bankName } = bankDetails || {}
      if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
        return res.status(400).json({ success: false, error: 'Bank details are required for bank_transfer refund' })
      }
    }
  }

  // Wallet credit amount (refundAmount + 10% bonus)
  const walletCreditAmount = refundMethod === 'wallet'
    ? Math.round(refundAmount * 1.10 * 100) / 100
    : 0

  const returnDoc = await Return.create({
    orderId,
    customerEmail:  user.email,
    customerId:     user._id,
    type,
    items:          requestItems,
    comment:        comment?.trim() || undefined,
    refundAmount:   type === 'return' ? refundAmount : Math.abs(priceDifference < 0 ? -priceDifference : 0),
    exchangeType:   resolvedExchangeType,
    newProduct:     newProductRecord,
    priceDifference,
    priceDifferencePayment: {
      status: pdpStatus,
      amount: priceDifference > 0 ? priceDifference : undefined,
    },
    refundMethod:       refundMethod || undefined,
    bankDetails:        refundMethod === 'bank_transfer' ? bankDetails : undefined,
    walletCreditAmount: walletCreditAmount || 0,
    originalReturnId,
    resubmissionCount,
    statusHistory: [{
      status:    'requested',
      timestamp: new Date(),
      note:      resubmissionCount > 0
        ? `Resubmission of ${originalReturnId}`
        : 'Request submitted by customer',
      updatedBy: 'customer',
    }],
  })

  sendReturnConfirmationEmail(returnDoc).catch(() => {})

  res.status(201).json({
    success:         true,
    message:         'Request submitted successfully',
    returnId:        returnDoc.returnId,
    type:            returnDoc.type,
    status:          returnDoc.status,
    refundAmount:    returnDoc.refundAmount,
    priceDifference: returnDoc.priceDifference,
  })
}

/* ── GET /api/returns/eligible-products ──────────────────────────────────────── */
exports.getEligibleProducts = async (req, res) => {
  const { productId, excludeProductId } = req.query

  if (!productId) {
    return res.status(400).json({ success: false, error: 'productId is required' })
  }

  const sourceProduct = await Product.findById(productId)
  if (!sourceProduct) {
    return res.status(404).json({ success: false, error: 'Product not found' })
  }

  const query = {
    category:  sourceProduct.category,
    isActive:  true,
    stock:     { $gt: 0 },
  }
  if (excludeProductId) {
    const mongoose = require('mongoose')
    query._id = { $ne: new mongoose.Types.ObjectId(excludeProductId) }
  }

  const products = await Product.find(query).select('name price images sizes colors sizeStock category')

  const result = products.map(p => {
    const availableSizes = (p.sizes || []).filter(sz => {
      const stock = p.sizeStock?.get?.(sz) ?? 0
      return stock > 0
    })
    return {
      _id:            p._id,
      name:           p.name,
      price:          p.price,
      images:         p.images,
      sizes:          p.sizes,
      colors:         p.colors,
      category:       p.category,
      availableSizes,
    }
  }).filter(p => p.availableSizes.length > 0)

  res.json({ success: true, products: result })
}

/* ── POST /api/returns/:returnId/initiate-payment ────────────────────────────── */
exports.initiatePayment = async (req, res) => {
  const returnDoc = await Return.findOne({
    returnId:      req.params.returnId,
    customerEmail: req.user.email,
  })

  if (!returnDoc) return res.status(404).json({ success: false, error: 'Request not found' })
  if (returnDoc.status !== 'approved') {
    return res.status(400).json({ success: false, error: 'Payment can only be initiated for approved requests' })
  }
  if (returnDoc.priceDifferencePayment?.status !== 'pending') {
    return res.status(400).json({ success: false, error: 'No payment required for this request' })
  }

  const transactionId = `RETDIFF_${returnDoc.returnId}_${Date.now()}`
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
  const serverUrl = process.env.SERVER_URL || 'http://localhost:5000'

  const phonePeRes = await phonePeInitiate({
    transactionId,
    amount:      returnDoc.priceDifference,
    phone:       req.user.phone || '9999999999',
    redirectUrl: `${clientUrl}/return-payment-callback?transactionId=${transactionId}`,
    callbackUrl: `${serverUrl}/api/payment/callback`,
  })

  if (!phonePeRes.success) {
    return res.status(500).json({ success: false, error: 'Failed to initiate payment. Please try again.' })
  }

  returnDoc.priceDifferencePayment.transactionId = transactionId
  await returnDoc.save()

  const redirectUrl = phonePeRes.data?.instrumentResponse?.redirectInfo?.url || ''

  res.json({
    success:       true,
    transactionId,
    redirectUrl,
    amount:        returnDoc.priceDifference,
  })
}

/* ── POST /api/returns/verify-payment/:transactionId ─────────────────────────── */
exports.verifyPayment = async (req, res) => {
  const { transactionId } = req.params
  const { checkPaymentStatus } = require('../utils/phonePeService')

  const returnDoc = await Return.findOne({
    'priceDifferencePayment.transactionId': transactionId,
    customerEmail: req.user.email,
  })

  if (!returnDoc) return res.status(404).json({ success: false, error: 'Request not found' })

  if (returnDoc.priceDifferencePayment.status === 'paid') {
    return res.json({ success: true, paymentStatus: 'PAYMENT_SUCCESS', returnId: returnDoc.returnId })
  }

  const phonePeData = await checkPaymentStatus(transactionId)
  const isSuccess   = phonePeData.success === true && phonePeData.code === 'PAYMENT_SUCCESS'
  const FAILED_CODES = new Set(['PAYMENT_ERROR', 'PAYMENT_DECLINED', 'TIMED_OUT', 'TRANSACTION_NOT_FOUND'])
  const isFailed    = FAILED_CODES.has(phonePeData.code)

  if (isSuccess) {
    returnDoc.priceDifferencePayment.status = 'paid'
    returnDoc.priceDifferencePayment.paidAt  = new Date()
    returnDoc.status = 'pickup_scheduled'
    returnDoc.statusHistory.push({
      status:    'pickup_scheduled',
      note:      'Price difference payment confirmed',
      updatedBy: 'customer',
    })
    await returnDoc.save()
    return res.json({ success: true, paymentStatus: 'PAYMENT_SUCCESS', returnId: returnDoc.returnId })
  }

  if (isFailed) {
    returnDoc.priceDifferencePayment.status = 'failed'
    await returnDoc.save()
    return res.json({ success: true, paymentStatus: 'PAYMENT_ERROR', returnId: returnDoc.returnId })
  }

  res.json({ success: true, paymentStatus: 'PAYMENT_PENDING', returnId: returnDoc.returnId })
}

/* ── GET /api/returns/my-requests ────────────────────────────────────────────── */
exports.getMyRequests = async (req, res) => {
  const requests = await Return.find({ customerEmail: req.user.email })
    .sort({ createdAt: -1 })
    .select('-internalNote')

  res.json({
    success: true,
    requests: requests.map((r) => ({
      returnId:              r.returnId,
      orderId:               r.orderId,
      type:                  r.type,
      status:                r.status,
      createdAt:             r.createdAt,
      refundAmount:          r.refundAmount,
      adminNote:             r.adminNote,
      itemCount:             r.items.length,
      items:                 r.items.map((i) => ({ name: i.name, image: i.image, qty: i.qty })),
      exchangeType:          r.exchangeType,
      priceDifference:       r.priceDifference,
      priceDifferencePayment:r.priceDifferencePayment,
      refundMethod:          r.refundMethod,
      walletCreditAmount:    r.walletCreditAmount,
      rejectionType:         r.rejectionType,
      resubmissionAllowed:   r.resubmissionAllowed,
      resubmissionCount:     r.resubmissionCount,
    })),
  })
}

/* ── GET /api/returns/:returnId ──────────────────────────────────────────────── */
exports.getRequestById = async (req, res) => {
  const returnDoc = await Return.findOne({
    returnId:      req.params.returnId,
    customerEmail: req.user.email,
  }).select('-internalNote')

  if (!returnDoc) return res.status(404).json({ success: false, error: 'Request not found' })
  res.json({ success: true, request: returnDoc })
}

/* ── PATCH /api/returns/:returnId/cancel ─────────────────────────────────────── */
exports.cancelRequest = async (req, res) => {
  const returnDoc = await Return.findOne({
    returnId:      req.params.returnId,
    customerEmail: req.user.email,
  })

  if (!returnDoc) return res.status(404).json({ success: false, error: 'Request not found' })
  if (returnDoc.status === 'cancelled') {
    return res.status(400).json({ success: false, error: 'Already cancelled' })
  }

  const { status, type } = returnDoc
  const returnCancellable  = ['requested', 'approved']
  const exchangeCancellable = ['requested', 'approved', 'pickup_scheduled']

  if (type === 'return' && !returnCancellable.includes(status)) {
    return res.status(400).json({ success: false, error: 'Cannot cancel after pickup has been scheduled.' })
  }
  if (type === 'exchange' && !exchangeCancellable.includes(status)) {
    return res.status(400).json({ success: false, error: 'Cannot cancel after the new item has been dispatched.' })
  }

  const note = 'Cancelled by customer'
  const historyEntry = { status: 'cancelled', note, updatedBy: 'customer' }

  if (returnDoc.priceDifferencePayment?.status === 'paid') {
    historyEntry.note = `Cancelled by customer. Price difference payment of ₹${returnDoc.priceDifference} needs to be refunded to customer.`
  }

  returnDoc.status = 'cancelled'
  returnDoc.statusHistory.push(historyEntry)
  await returnDoc.save()

  res.json({ success: true, message: 'Request cancelled' })
}
