const Order = require('../models/Order')
const generateInvoice = require('../utils/generateInvoice')
const generateAddressLabel = require('../utils/generateAddressLabel')
const generateCombinedPdf = require('../utils/generateCombinedPdf')

/* ── GET /api/my-orders ──────────────────────────────────────────────────────── */
exports.getMyOrders = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query
  const userEmail = req.user.email

  const query = { email: userEmail }
  if (status && status !== 'all') query.status = status

  const skip  = (Number(page) - 1) * Number(limit)
  const total = await Order.countDocuments(query)

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .select('orderId createdAt status total items shippingAddress')

  const totalPages = Math.ceil(total / Number(limit))
  const current    = Number(page)

  res.json({
    success: true,
    orders: orders.map((o) => ({
      orderId:   o.orderId,
      createdAt: o.createdAt,
      status:    o.status,
      total:     o.total,
      itemCount: o.items.length,
      items: o.items.map((item) => ({
        name:  item.name,
        image: item.image,
        price: item.price,
        qty:   item.qty,
        size:  item.size,
        color: item.color,
      })),
      shippingAddress: {
        city:  o.shippingAddress?.city  || '',
        state: o.shippingAddress?.state || '',
      },
    })),
    totalOrders:  total,
    totalPages,
    currentPage:  current,
    hasNextPage:  current < totalPages,
    hasPrevPage:  current > 1,
  })
}

/* ── GET /api/my-orders/:orderId ─────────────────────────────────────────────── */
exports.getMyOrderById = async (req, res) => {
  const userEmail = req.user.email

  const order = await Order.findOne({
    orderId: req.params.orderId,
    email:   userEmail,
  })

  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' })
  }

  res.json({
    success: true,
    order: {
      orderId:        order.orderId,
      createdAt:      order.createdAt,
      status:         order.status,
      statusHistory:  order.statusHistory,
      items: order.items.map((item) => ({
        productId: item.productId,
        name:      item.name,
        image:     item.image,
        price:     item.price,
        qty:       item.qty,
        size:      item.size,
        color:     item.color,
        subtotal:  item.price * item.qty,
      })),
      shippingAddress: {
        fullName:     order.customerName,
        phone:        order.phone,
        addressLine1: order.shippingAddress?.addressLine1 || '',
        addressLine2: order.shippingAddress?.addressLine2 || '',
        city:         order.shippingAddress?.city         || '',
        state:        order.shippingAddress?.state        || '',
        pincode:      order.shippingAddress?.pincode      || '',
      },
      subtotal:       order.subtotal,
      discount:       order.discount,
      couponCode:     order.couponCode,
      shippingCharge: order.shippingCharge,
      total:          order.total,
      paymentMethod:  order.paymentMethod,
      paymentStatus:  order.paymentStatus,
      trackingNumber: order.trackingNumber,
    },
  })
}

/* ── GET /api/my-orders/:orderId/invoice ──────────────────────────────────── */
exports.downloadInvoice = async (req, res) => {
  const order = await Order.findOne({
    orderId: req.params.orderId,
    email: req.user.email,
  })

  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' })
  }

  const pdfBuffer = await generateInvoice(order)
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="INV-${order.orderId}.pdf"`,
    'Content-Length': pdfBuffer.length,
  })
  res.send(pdfBuffer)
}

/* ── GET /api/my-orders/:orderId/address-label ────────────────────────────── */
exports.downloadAddressLabel = async (req, res) => {
  const order = await Order.findOne({
    orderId: req.params.orderId,
    email: req.user.email,
  })

  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' })
  }

  const pdfBuffer = await generateAddressLabel(order)
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="LABEL-${order.orderId}.pdf"`,
    'Content-Length': pdfBuffer.length,
  })
  res.send(pdfBuffer)
}

/* ── GET /api/my-orders/:orderId/print ──────────────────────────────────── */
exports.downloadCombined = async (req, res) => {
  const order = await Order.findOne({
    orderId: req.params.orderId,
    email: req.user.email,
  })

  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' })
  }

  const pdfBuffer = await generateCombinedPdf(order)
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="ZYLARA-${order.orderId}.pdf"`,
    'Content-Length': pdfBuffer.length,
  })
  res.send(pdfBuffer)
}
