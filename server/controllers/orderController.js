const Order = require('../models/Order')
const Product = require('../models/Product')
const Coupon = require('../models/Coupon')
const Settings = require('../models/Settings')
const { sendOrderConfirmationEmail, sendOrderStatusEmail } = require('../utils/sendEmail')
const generateOrderId = require('../utils/generateOrderId')
const phonePeService = require('../utils/phonePeService')

const getShippingSettings = async () => {
  const settings = await Settings.findOne()
  return {
    shippingCharge: settings?.shippingCharge ?? 99,
    freeShippingThreshold: settings?.freeShippingThreshold ?? 999,
  }
}

exports.createOrder = async (req, res) => {
  const {
    customerName, email, phone, shippingAddress,
    items, paymentMethod, couponCode,
  } = req.body

  // Stock validation — track qty per product and per size
  const orderByProduct = {}
  for (const item of items) {
    if (item.productId) {
      if (!orderByProduct[item.productId]) orderByProduct[item.productId] = { total: 0, bySize: {} }
      const size = item.size || 'One Size'
      orderByProduct[item.productId].total += item.qty
      orderByProduct[item.productId].bySize[size] = (orderByProduct[item.productId].bySize[size] || 0) + item.qty
    }
  }
  const productIds = Object.keys(orderByProduct)
  const productMap = {}
  if (productIds.length > 0) {
    const products = await Product.find({ _id: { $in: productIds } }).select('name stock sizeStock isActive')
    products.forEach((p) => { productMap[p._id.toString()] = p })

    for (const [pid, { total, bySize }] of Object.entries(orderByProduct)) {
      const product = productMap[pid]
      const itemName = items.find((i) => i.productId === pid)?.name || 'A product'
      if (!product) {
        return res.status(400).json({ success: false, error: `"${itemName}" is no longer available.` })
      }
      if (product.isActive === false) {
        return res.status(400).json({ success: false, error: `"${product.name}" is no longer available.` })
      }
      if (product.sizeStock && product.sizeStock.size > 0) {
        // Per-size stock check
        for (const [size, qty] of Object.entries(bySize)) {
          const available = product.sizeStock.get(size) ?? 0
          if (available < qty) {
            if (available === 0) {
              return res.status(400).json({
                success: false,
                error: `Size ${size} of "${product.name}" is out of stock.`,
              })
            }
            return res.status(400).json({
              success: false,
              error: `Only ${available} left in size ${size} for "${product.name}". Please update your cart.`,
            })
          }
        }
      } else {
        // Fallback: total stock check
        if (product.stock < total) {
          if (product.stock === 0) {
            return res.status(400).json({ success: false, error: `"${product.name}" is out of stock.` })
          }
          return res.status(400).json({
            success: false,
            error: `Only ${product.stock} left for "${product.name}". Please update your cart.`,
          })
        }
      }
    }
  }

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)

  // Validate and apply coupon
  let discount = 0
  let appliedCouponCode = null

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
    })

    if (coupon) {
      const now = new Date()
      const notExpired = !coupon.expiresAt || coupon.expiresAt > now
      const notMaxed = coupon.maxUses === null || coupon.usedCount < coupon.maxUses
      const meetsMin = subtotal >= coupon.minOrderValue

      if (notExpired && notMaxed && meetsMin) {
        if (coupon.discountType === 'percentage') {
          discount = Math.round((subtotal * coupon.discountValue) / 100)
        } else {
          discount = coupon.discountValue
        }
        appliedCouponCode = coupon.code
        // Increment usage count
        coupon.usedCount += 1
        await coupon.save()
      }
    }
  }

  const { shippingCharge: baseCharge, freeShippingThreshold } = await getShippingSettings()
  const discountedSubtotal = subtotal - discount
  const shippingCharge = discountedSubtotal >= freeShippingThreshold ? 0 : baseCharge
  const total = discountedSubtotal + shippingCharge

  const isOnline = paymentMethod?.toUpperCase() === 'ONLINE'

  // For ONLINE orders: initiate PhonePe BEFORE creating the order so that if
  // PhonePe is unavailable, no DB state is mutated (no order, no stock change).
  let phonePeRedirectUrl = null
  let phonePeTransactionId = null

  if (isOnline) {
    const pregenOrderId = generateOrderId()
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000'
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

    const ppResponse = await phonePeService.initiatePayment({
      transactionId: pregenOrderId,
      amount: total,
      phone,
      redirectUrl: `${clientUrl}/payment-callback?transactionId=${pregenOrderId}`,
      callbackUrl: `${backendUrl}/api/payment/callback`,
    })

    const redirectUrl = ppResponse?.data?.instrumentResponse?.redirectInfo?.url
    if (!ppResponse?.success || !redirectUrl) {
      console.error('[PhonePe] Initiation failed:', JSON.stringify(ppResponse))
      const err = new Error(
        `Payment gateway error: ${ppResponse?.code || 'UNKNOWN'} — ${ppResponse?.message || 'no message'}`
      )
      err.statusCode = 502
      throw err
    }

    phonePeRedirectUrl = redirectUrl
    phonePeTransactionId = pregenOrderId
  }

  const order = await Order.create({
    ...(phonePeTransactionId ? { orderId: phonePeTransactionId } : {}),
    customerName,
    email,
    phone,
    shippingAddress,
    items,
    subtotal,
    discount,
    couponCode: appliedCouponCode,
    shippingCharge,
    total,
    paymentMethod: isOnline ? 'ONLINE' : 'COD',
    ...(phonePeTransactionId ? { phonePeTransactionId } : {}),
    statusHistory: [{ status: 'pending', note: 'Order placed' }],
  })

  // Decrement stock for each product
  if (productIds.length > 0) {
    await Promise.all(
      Object.entries(orderByProduct).map(([pid, { total, bySize }]) => {
        const product = productMap[pid]
        if (product?.sizeStock?.size > 0) {
          const inc = { stock: -total }
          for (const [size, qty] of Object.entries(bySize)) {
            inc[`sizeStock.${size}`] = -qty
          }
          return Product.findByIdAndUpdate(pid, { $inc: inc })
        }
        return Product.findByIdAndUpdate(pid, { $inc: { stock: -total } })
      })
    )
  }

  if (isOnline) {
    // For ONLINE orders the confirmation email is sent after payment is verified
    return res.status(201).json({
      success: true,
      paymentMethod: 'ONLINE',
      redirectUrl: phonePeRedirectUrl,
      transactionId: phonePeTransactionId,
      orderId: order.orderId,
    })
  }

  // COD: send confirmation email and respond (original behaviour, unchanged)
  sendOrderConfirmationEmail(order).catch((err) => {
    console.error('Email send failed:', err.message)
  })

  const estimatedDelivery = new Date()
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5)

  res.status(201).json({
    success: true,
    orderId: order.orderId,
    total: order.total,
    estimatedDelivery: estimatedDelivery.toISOString().split('T')[0],
  })
}

exports.trackOrder = async (req, res) => {
  const { orderId, email } = req.query

  if (!orderId || !email) {
    return res.status(400).json({ success: false, error: 'orderId and email are required' })
  }

  // emails are stored lowercase — plain equality is safe and avoids regex injection
  const order = await Order.findOne({
    orderId,
    email: email.toLowerCase(),
  })

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found. Check your Order ID and email.',
    })
  }

  res.json({ success: true, order })
}

exports.validateCoupon = async (req, res) => {
  const { code, orderTotal } = req.body

  if (!code) {
    return res.status(400).json({ success: false, error: 'Coupon code is required' })
  }

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  })

  if (!coupon) {
    return res.json({ success: true, valid: false, message: 'Invalid coupon code' })
  }

  const now = new Date()
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return res.json({ success: true, valid: false, message: 'Coupon has expired' })
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return res.json({ success: true, valid: false, message: 'Coupon usage limit reached' })
  }

  const total = Number(orderTotal) || 0
  if (total < coupon.minOrderValue) {
    return res.json({
      success: true,
      valid: false,
      message: `Minimum order value is ₹${coupon.minOrderValue}`,
    })
  }

  let discountAmount = 0
  if (coupon.discountType === 'percentage') {
    discountAmount = Math.round((total * coupon.discountValue) / 100)
  } else {
    discountAmount = coupon.discountValue
  }

  res.json({
    success: true,
    valid: true,
    discountAmount,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    message: `${coupon.discountValue}${coupon.discountType === 'percentage' ? '%' : '₹'} off applied!`,
  })
}

// ─── Admin ────────────────────────────────────────────────────────────────────

exports.adminGetOrders = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = 20
  const skip = (page - 1) * limit

  const filter = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {}
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate)
    if (req.query.endDate) {
      const end = new Date(req.query.endDate)
      end.setHours(23, 59, 59, 999)
      filter.createdAt.$lte = end
    }
  }
  if (req.query.search) {
    const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const rx = new RegExp(escaped, 'i')
    filter.$or = [{ orderId: rx }, { email: rx }, { customerName: rx }]
  }

  const total = await Order.countDocuments(filter)
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  // Status counts for dashboard
  const statusCounts = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ])
  const ordersByStatus = {}
  statusCounts.forEach(({ _id, count }) => { ordersByStatus[_id] = count })

  res.json({
    success: true,
    count: orders.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    ordersByStatus,
    orders,
  })
}

exports.adminGetOrder = async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId })
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' })
  res.json({ success: true, order })
}

exports.updateOrderStatus = async (req, res) => {
  const { status, trackingNumber, note } = req.body
  const order = await Order.findOne({ orderId: req.params.orderId })
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' })

  const validStatuses = ['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' })
  }

  order.status = status
  if (trackingNumber) order.trackingNumber = trackingNumber
  order.statusHistory.push({ status, note: note || '', timestamp: new Date() })
  await order.save()

  // Fire-and-forget status email
  sendOrderStatusEmail(order).catch((err) => {
    console.error('Status email failed:', err.message)
  })

  res.json({ success: true, order })
}

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({ orderId: req.params.orderId })
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' })
    res.json({ success: true, message: 'Order deleted successfully' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Deletion failed' })
  }
}
