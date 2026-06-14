const Order  = require('../models/Order')
const Return = require('../models/Return')
const { checkPaymentStatus, verifyCallbackSignature } = require('../utils/phonePeService')
const { sendOrderConfirmationEmail } = require('../utils/sendEmail')

// Terminal PhonePe codes that mean payment is definitively failed
const FAILED_CODES = new Set(['PAYMENT_ERROR', 'PAYMENT_DECLINED', 'TIMED_OUT', 'TRANSACTION_NOT_FOUND'])

// ─── PhonePe S2S Callback ─────────────────────────────────────────────────────
// PhonePe POSTs here when payment status changes.
// Must always return HTTP 200 — any non-200 triggers PhonePe retries.
exports.phonePeCallback = async (req, res) => {
  const { response } = req.body
  const xVerify = req.headers['x-verify']

  if (!response || !xVerify) {
    return res.status(200).json({ success: false })
  }

  if (!verifyCallbackSignature(response, xVerify)) {
    console.error('[PhonePe Callback] Signature verification failed')
    return res.status(200).json({ success: false })
  }

  let decoded
  try {
    decoded = JSON.parse(Buffer.from(response, 'base64').toString('utf8'))
  } catch {
    console.error('[PhonePe Callback] Failed to decode response payload')
    return res.status(200).json({ success: false })
  }

  const transactionId = decoded?.data?.merchantTransactionId
  const code = decoded?.code

  if (!transactionId) {
    return res.status(200).json({ success: false })
  }

  // Handle return price-difference payments
  if (transactionId.startsWith('RETDIFF_')) {
    const returnDoc = await Return.findOne({ 'priceDifferencePayment.transactionId': transactionId })
    if (returnDoc && returnDoc.priceDifferencePayment?.status === 'pending') {
      if (decoded.success === true && code === 'PAYMENT_SUCCESS') {
        returnDoc.priceDifferencePayment.status = 'paid'
        returnDoc.priceDifferencePayment.paidAt  = new Date()
        returnDoc.status = 'pickup_scheduled'
        returnDoc.statusHistory.push({
          status:    'pickup_scheduled',
          note:      'Price difference payment confirmed via PhonePe callback',
          updatedBy: 'customer',
        })
        await returnDoc.save()
      } else if (FAILED_CODES.has(code)) {
        returnDoc.priceDifferencePayment.status = 'failed'
        await returnDoc.save()
      }
    }
    return res.status(200).json({ success: true })
  }

  const order = await Order.findOne({ phonePeTransactionId: transactionId })
  if (!order) {
    console.error(`[PhonePe Callback] No order for transactionId: ${transactionId}`)
    return res.status(200).json({ success: true }) // 200 so PhonePe stops retrying
  }

  // Idempotency: skip if already resolved
  if (order.paymentStatus !== 'pending') {
    return res.status(200).json({ success: true })
  }

  if (decoded.success === true && code === 'PAYMENT_SUCCESS') {
    order.paymentStatus = 'paid'
    order.status = 'confirmed'
    order.statusHistory.push({
      status: 'confirmed',
      note: 'Payment confirmed via PhonePe callback',
      timestamp: new Date(),
    })
    await order.save()
    sendOrderConfirmationEmail(order).catch((err) =>
      console.error('[PhonePe Callback] Email error:', err.message)
    )
  } else if (FAILED_CODES.has(code)) {
    order.paymentStatus = 'failed'
    order.statusHistory.push({
      status: order.status,
      note: `Payment failed: ${code}`,
      timestamp: new Date(),
    })
    await order.save()
  }
  // PAYMENT_PENDING: no action, await further callbacks

  res.status(200).json({ success: true })
}

// ─── Verify Payment (called by frontend after PhonePe redirect) ───────────────
exports.verifyPayment = async (req, res) => {
  const { transactionId } = req.params

  const order = await Order.findOne({ phonePeTransactionId: transactionId })
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' })
  }

  // If S2S callback already resolved the payment, return from DB (no extra API call)
  if (order.paymentStatus === 'paid') {
    return res.json(buildSuccessResponse(order))
  }
  if (order.paymentStatus === 'failed') {
    return res.json({ success: true, paymentStatus: 'PAYMENT_ERROR', orderId: order.orderId })
  }

  // Still pending — ask PhonePe for the authoritative status
  const phonePeData = await checkPaymentStatus(transactionId)
  const isSuccess = phonePeData.success === true && phonePeData.code === 'PAYMENT_SUCCESS'
  const isFailed = FAILED_CODES.has(phonePeData.code)

  if (isSuccess) {
    order.paymentStatus = 'paid'
    order.status = 'confirmed'
    order.statusHistory.push({
      status: 'confirmed',
      note: 'Payment verified via status poll',
      timestamp: new Date(),
    })
    await order.save()
    sendOrderConfirmationEmail(order).catch((err) =>
      console.error('[PhonePe Verify] Email error:', err.message)
    )
    return res.json(buildSuccessResponse(order))
  }

  if (isFailed) {
    order.paymentStatus = 'failed'
    order.statusHistory.push({
      status: order.status,
      note: `Payment failed: ${phonePeData.code}`,
      timestamp: new Date(),
    })
    await order.save()
    return res.json({ success: true, paymentStatus: 'PAYMENT_ERROR', orderId: order.orderId })
  }

  // Still genuinely pending (e.g. bank processing)
  res.json({ success: true, paymentStatus: 'PAYMENT_PENDING', orderId: order.orderId })
}

function buildSuccessResponse(order) {
  const estimatedDelivery = new Date(order.createdAt)
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5)
  return {
    success: true,
    paymentStatus: 'PAYMENT_SUCCESS',
    orderId: order.orderId,
    total: order.total,
    customerName: order.customerName,
    email: order.email,
    items: order.items,
    estimatedDelivery: estimatedDelivery.toISOString().split('T')[0],
  }
}
