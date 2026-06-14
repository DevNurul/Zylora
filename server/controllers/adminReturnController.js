const Return = require('../models/Return')
const Order  = require('../models/Order')
const User   = require('../models/User')
const { sendReturnStatusEmail } = require('../utils/emailService')

const ALLOWED_TRANSITIONS = {
  requested:           ['approved', 'rejected', 'cancelled'],
  approved:            ['payment_pending', 'pickup_scheduled', 'cancelled'],
  payment_pending:     ['pickup_scheduled', 'cancelled'],
  pickup_scheduled:    ['item_received', 'cancelled'],
  item_received:       ['refund_approved', 'refund_rejected', 'exchange_dispatched'],
  refund_approved:     ['refund_processed'],
  refund_rejected:     [],
  refund_processed:    [],
  exchange_dispatched: ['exchange_delivered'],
  exchange_delivered:  [],
  rejected:            [],
  cancelled:           [],
}

const ALL_STATUSES = [
  'requested','approved','rejected','payment_pending','pickup_scheduled','item_received',
  'refund_approved','refund_rejected','refund_processed',
  'exchange_dispatched','exchange_delivered','cancelled',
]

/* ── GET /api/admin/returns ──────────────────────────────────────────────────── */
exports.getAllReturns = async (req, res) => {
  const { page = 1, limit = 20, status, type, search } = req.query

  const query = {}
  if (status && status !== 'all') query.status = status
  if (type   && type   !== 'all') query.type   = type
  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    query.$or = [{ returnId: rx }, { orderId: rx }, { customerEmail: rx }]
  }

  const skip  = (Number(page) - 1) * Number(limit)
  const total = await Return.countDocuments(query)

  const requests = await Return.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))

  const counts = await Return.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ])
  const statusCounts = Object.fromEntries(ALL_STATUSES.map(s => [s, 0]))
  counts.forEach(({ _id, count }) => { statusCounts[_id] = count })

  res.json({
    success: true,
    requests,
    totalRequests: total,
    totalPages:    Math.ceil(total / Number(limit)),
    currentPage:   Number(page),
    statusCounts,
  })
}

/* ── GET /api/admin/returns/:returnId ────────────────────────────────────────── */
exports.getReturnById = async (req, res) => {
  const returnDoc = await Return.findOne({ returnId: req.params.returnId })
  if (!returnDoc) return res.status(404).json({ success: false, error: 'Request not found' })
  res.json({ success: true, request: returnDoc })
}

/* ── PATCH /api/admin/returns/:returnId/status ───────────────────────────────── */
exports.updateReturnStatus = async (req, res) => {
  const {
    status: newStatus,
    adminNote, internalNote,
    rejectionType,
    refundAmount, refundReference,
    pickupDate, exchangeTrackingNumber,
  } = req.body

  const returnDoc = await Return.findOne({ returnId: req.params.returnId })
  if (!returnDoc) return res.status(404).json({ success: false, error: 'Request not found' })

  const allowed = ALLOWED_TRANSITIONS[returnDoc.status] || []
  if (!allowed.includes(newStatus)) {
    return res.status(400).json({ success: false, error: 'Invalid status transition' })
  }

  // Rejection type required when rejecting
  if (newStatus === 'rejected') {
    if (!rejectionType || !['soft', 'hard'].includes(rejectionType)) {
      return res.status(400).json({ success: false, error: 'rejectionType (soft or hard) is required when rejecting' })
    }
    if (!adminNote?.trim()) {
      return res.status(400).json({ success: false, error: 'Rejection reason is required for rejection' })
    }
  }

  // Validate required fields per status
  if (newStatus === 'refund_approved' && (refundAmount === undefined || refundAmount === null)) {
    return res.status(400).json({ success: false, error: 'refundAmount is required for refund_approved' })
  }
  if (newStatus === 'refund_processed' && !refundReference?.trim()) {
    return res.status(400).json({ success: false, error: 'refundReference is required for refund_processed' })
  }
  if (newStatus === 'exchange_dispatched' && !exchangeTrackingNumber?.trim()) {
    return res.status(400).json({ success: false, error: 'exchangeTrackingNumber is required for exchange_dispatched' })
  }
  if (newStatus === 'pickup_scheduled' && !pickupDate) {
    return res.status(400).json({ success: false, error: 'pickupDate is required for pickup_scheduled' })
  }

  returnDoc.status = newStatus
  if (adminNote)              returnDoc.adminNote    = adminNote.trim()
  if (internalNote)           returnDoc.internalNote = internalNote.trim()
  if (refundAmount !== undefined) returnDoc.refundAmount = Number(refundAmount)
  if (refundReference)        returnDoc.refundReference       = refundReference.trim()
  if (pickupDate)             returnDoc.pickupDate            = new Date(pickupDate)
  if (exchangeTrackingNumber) returnDoc.exchangeTrackingNumber = exchangeTrackingNumber.trim()

  // Set rejection metadata
  if (newStatus === 'rejected') {
    returnDoc.rejectionType       = rejectionType
    returnDoc.resubmissionAllowed = rejectionType === 'soft'
  }

  // On refund_approved for wallet method: create pending wallet transaction on user
  if (newStatus === 'refund_approved' && returnDoc.refundMethod === 'wallet') {
    const user = await User.findById(returnDoc.customerId)
    if (user) {
      if (!user.wallet) user.wallet = { balance: 0, transactions: [] }
      const creditAmt  = Number(refundAmount)
      const bonusAmt   = Math.round(creditAmt * 0.10 * 100) / 100
      const totalCredit = creditAmt + bonusAmt
      returnDoc.walletCreditAmount = totalCredit

      user.wallet.transactions.push({
        type:        'credit',
        amount:      creditAmt,
        bonusAmount: bonusAmt,
        description: `Return refund for ${returnDoc.returnId}`,
        returnId:    returnDoc.returnId,
        status:      'pending',
      })
      await user.save()
    }
  }

  // On refund_processed for bank_transfer: nothing extra needed beyond refundReference

  // On exchange_delivered: mark order items as exchangeUsed
  if (newStatus === 'exchange_delivered') {
    const order = await Order.findOne({ orderId: returnDoc.orderId })
    if (order) {
      for (const retItem of returnDoc.items) {
        const orderItem = order.items.find(
          i => i.productId?.toString() === retItem.productId?.toString()
        )
        if (orderItem) orderItem.exchangeUsed = true
      }
      await order.save()
    }
  }

  returnDoc.statusHistory.push({
    status:    newStatus,
    note:      adminNote || `Status updated to ${newStatus}`,
    updatedBy: 'admin',
  })

  await returnDoc.save()
  sendReturnStatusEmail(returnDoc).catch(() => {})

  res.json({ success: true, request: returnDoc })
}
