const User = require('../models/User')

/* ── GET /api/wallet ─────────────────────────────────────────────────────────── */
exports.getWallet = async (req, res) => {
  const user = await User.findById(req.user._id).select('wallet')
  if (!user) return res.status(404).json({ success: false, error: 'User not found' })

  const wallet = user.wallet || { balance: 0, transactions: [] }
  const transactions = (wallet.transactions || [])
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 20)

  res.json({
    success: true,
    wallet: {
      balance:      wallet.balance || 0,
      transactions,
    },
  })
}

/* ── POST /api/wallet/apply ──────────────────────────────────────────────────── */
exports.applyWallet = async (req, res) => {
  const { orderId, amountToUse, orderTotal } = req.body

  if (!amountToUse || amountToUse <= 0) {
    return res.status(400).json({ success: false, error: 'amountToUse must be greater than 0' })
  }

  const user = await User.findById(req.user._id)
  if (!user) return res.status(404).json({ success: false, error: 'User not found' })

  const balance = user.wallet?.balance || 0
  if (amountToUse > balance) {
    return res.status(400).json({ success: false, error: 'Amount exceeds wallet balance' })
  }

  if (orderTotal && amountToUse > orderTotal * 0.80) {
    return res.status(400).json({
      success: false,
      error: `Wallet can cover at most 80% of the order total (₹${Math.floor(orderTotal * 0.80)})`,
    })
  }

  user.wallet.balance -= amountToUse
  user.wallet.transactions.push({
    type:        'debit',
    amount:      amountToUse,
    description: `Applied to order ${orderId || 'checkout'}`,
    orderId:     orderId || undefined,
    status:      'approved',
  })
  await user.save()

  res.json({
    success:          true,
    discountApplied:  amountToUse,
    remainingBalance: user.wallet.balance,
  })
}

/* ── GET /api/admin/wallet/pending ───────────────────────────────────────────── */
exports.getPendingWalletCredits = async (req, res) => {
  const users = await User.find({ 'wallet.transactions.status': 'pending' })
    .select('name email wallet')

  const pendingCredits = []
  for (const user of users) {
    const pending = (user.wallet?.transactions || []).filter(t => t.status === 'pending' && t.type === 'credit')
    for (const txn of pending) {
      pendingCredits.push({
        userId:      user._id,
        userName:    user.name,
        email:       user.email,
        transactionId: txn._id,
        returnId:    txn.returnId,
        amount:      txn.amount,
        bonusAmount: txn.bonusAmount,
        totalCredit: txn.amount + txn.bonusAmount,
        description: txn.description,
        createdAt:   txn.createdAt,
      })
    }
  }

  pendingCredits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  res.json({ success: true, pendingCredits, total: pendingCredits.length })
}

/* ── PATCH /api/admin/wallet/:userId/approve ─────────────────────────────────── */
exports.approveWalletCredit = async (req, res) => {
  const { transactionId } = req.body

  const user = await User.findById(req.params.userId)
  if (!user) return res.status(404).json({ success: false, error: 'User not found' })

  const txn = user.wallet?.transactions?.id(transactionId)
  if (!txn) return res.status(404).json({ success: false, error: 'Transaction not found' })
  if (txn.status !== 'pending') {
    return res.status(400).json({ success: false, error: 'Transaction is not pending' })
  }

  const totalCredit = txn.amount + (txn.bonusAmount || 0)
  const sixMonths   = new Date()
  sixMonths.setMonth(sixMonths.getMonth() + 6)

  txn.status    = 'approved'
  txn.expiresAt = sixMonths
  user.wallet.balance += totalCredit
  await user.save()

  res.json({
    success:    true,
    newBalance: user.wallet.balance,
    totalCredit,
  })
}

/* ── PATCH /api/admin/wallet/:userId/reject ──────────────────────────────────── */
exports.rejectWalletCredit = async (req, res) => {
  const { transactionId, reason } = req.body

  const user = await User.findById(req.params.userId)
  if (!user) return res.status(404).json({ success: false, error: 'User not found' })

  const txn = user.wallet?.transactions?.id(transactionId)
  if (!txn) return res.status(404).json({ success: false, error: 'Transaction not found' })
  if (txn.status !== 'pending') {
    return res.status(400).json({ success: false, error: 'Transaction is not pending' })
  }

  txn.status = 'rejected'
  if (reason) txn.description += ` | Rejected: ${reason}`
  await user.save()

  res.json({ success: true })
}
