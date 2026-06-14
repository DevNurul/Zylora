const Coupon = require('../models/Coupon')

exports.adminGetCoupons = async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 })
  res.json({ success: true, count: coupons.length, coupons })
}

exports.createCoupon = async (req, res) => {
  const data = { ...req.body, code: req.body.code?.toUpperCase() }
  const coupon = await Coupon.create(data)
  res.status(201).json({ success: true, coupon })
}

exports.updateCoupon = async (req, res) => {
  if (req.body.code) req.body.code = req.body.code.toUpperCase()
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  if (!coupon) return res.status(404).json({ success: false, error: 'Coupon not found' })
  res.json({ success: true, coupon })
}

exports.deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id)
  if (!coupon) return res.status(404).json({ success: false, error: 'Coupon not found' })
  res.json({ success: true, message: 'Coupon deleted' })
}

exports.toggleCoupon = async (req, res) => {
  const coupon = await Coupon.findById(req.params.id)
  if (!coupon) return res.status(404).json({ success: false, error: 'Coupon not found' })
  coupon.isActive = !coupon.isActive
  await coupon.save()
  res.json({ success: true, isActive: coupon.isActive })
}
