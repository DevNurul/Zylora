const User = require('../models/User')
const { cloudinary } = require('../config/cloudinary')

/* ── Helpers ─────────────────────────────────────────────────────────────────── */

function pickUser(user) {
  return {
    _id:       user._id,
    name:      user.name,
    email:     user.email,
    phone:     user.phone,
    addresses: user.addresses,
    createdAt: user.createdAt,
  }
}

function validateAddress({ fullName, phone, addressLine1, city, state, pincode }) {
  if (!fullName?.trim())     return 'Full name is required'
  if (!phone?.trim())        return 'Phone number is required'
  if (!/^[0-9]{10}$/.test(phone.trim())) return 'Enter a valid 10-digit phone number'
  if (!addressLine1?.trim()) return 'Address line 1 is required'
  if (!city?.trim())         return 'City is required'
  if (!state?.trim())        return 'State is required'
  if (!pincode?.trim())      return 'Pincode is required'
  if (!/^[0-9]{6}$/.test(pincode.trim())) return 'Enter a valid 6-digit pincode'
  return null
}

/* ── GET /api/profile ────────────────────────────────────────────────────────── */

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('name email phone addresses createdAt')
  if (!user) return res.status(404).json({ success: false, error: 'User not found' })
  res.json({ success: true, user: pickUser(user) })
}

/* ── PUT /api/profile ────────────────────────────────────────────────────────── */

exports.updateProfile = async (req, res) => {
  const { name, phone } = req.body

  if (!name?.trim() || name.trim().length < 2) {
    return res.status(400).json({ success: false, error: 'Name must be at least 2 characters' })
  }
  if (!phone?.trim() || !/^[0-9]{10}$/.test(phone.trim())) {
    return res.status(400).json({ success: false, error: 'Enter a valid 10-digit phone number' })
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { name: name.trim(), phone: phone.trim() } },
    { new: true, runValidators: true }
  ).select('name email phone')

  if (!user) return res.status(404).json({ success: false, error: 'User not found' })

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: { _id: user._id, name: user.name, email: user.email, phone: user.phone },
  })
}

/* ── POST /api/profile/addresses ─────────────────────────────────────────────── */

exports.addAddress = async (req, res) => {
  const user = await User.findById(req.user._id).select('addresses')
  if (!user) return res.status(404).json({ success: false, error: 'User not found' })

  if (user.addresses.length >= 5) {
    return res.status(400).json({ success: false, error: 'Maximum 5 addresses allowed' })
  }

  const { label, fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body

  const err = validateAddress({ fullName, phone, addressLine1, city, state, pincode })
  if (err) return res.status(400).json({ success: false, error: err })

  const makeDefault = isDefault === true || user.addresses.length === 0
  if (makeDefault) {
    user.addresses.forEach((a) => { a.isDefault = false })
  }

  user.addresses.push({
    label:        label || 'Home',
    fullName:     fullName.trim(),
    phone:        phone.trim(),
    addressLine1: addressLine1.trim(),
    addressLine2: addressLine2?.trim() || '',
    city:         city.trim(),
    state:        state.trim(),
    pincode:      pincode.trim(),
    isDefault:    makeDefault,
  })

  await user.save()
  res.status(201).json({ success: true, message: 'Address added successfully', addresses: user.addresses })
}

/* ── PUT /api/profile/addresses/:addressId ───────────────────────────────────── */

exports.updateAddress = async (req, res) => {
  const user = await User.findById(req.user._id).select('addresses')
  if (!user) return res.status(404).json({ success: false, error: 'User not found' })

  const address = user.addresses.id(req.params.addressId)
  if (!address) return res.status(404).json({ success: false, error: 'Address not found' })

  const { label, fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body

  const err = validateAddress({
    fullName:     fullName     ?? address.fullName,
    phone:        phone        ?? address.phone,
    addressLine1: addressLine1 ?? address.addressLine1,
    city:         city         ?? address.city,
    state:        state        ?? address.state,
    pincode:      pincode      ?? address.pincode,
  })
  if (err) return res.status(400).json({ success: false, error: err })

  if (label        !== undefined) address.label        = label
  if (fullName     !== undefined) address.fullName     = fullName.trim()
  if (phone        !== undefined) address.phone        = phone.trim()
  if (addressLine1 !== undefined) address.addressLine1 = addressLine1.trim()
  if (addressLine2 !== undefined) address.addressLine2 = addressLine2?.trim() ?? ''
  if (city         !== undefined) address.city         = city.trim()
  if (state        !== undefined) address.state        = state.trim()
  if (pincode      !== undefined) address.pincode      = pincode.trim()

  if (isDefault === true) {
    user.addresses.forEach((a) => { a.isDefault = false })
    address.isDefault = true
  }

  await user.save()
  res.json({ success: true, message: 'Address updated successfully', addresses: user.addresses })
}

/* ── DELETE /api/profile/addresses/:addressId ────────────────────────────────── */

exports.deleteAddress = async (req, res) => {
  const user = await User.findById(req.user._id).select('addresses')
  if (!user) return res.status(404).json({ success: false, error: 'User not found' })

  const address = user.addresses.id(req.params.addressId)
  if (!address) return res.status(404).json({ success: false, error: 'Address not found' })

  const wasDefault = address.isDefault
  address.deleteOne()

  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true
  }

  await user.save()
  res.json({ success: true, message: 'Address removed successfully', addresses: user.addresses })
}

/* ── PATCH /api/profile/addresses/:addressId/default ────────────────────────── */

exports.setDefaultAddress = async (req, res) => {
  const user = await User.findById(req.user._id).select('addresses')
  if (!user) return res.status(404).json({ success: false, error: 'User not found' })

  const address = user.addresses.id(req.params.addressId)
  if (!address) return res.status(404).json({ success: false, error: 'Address not found' })

  user.addresses.forEach((a) => { a.isDefault = false })
  address.isDefault = true

  await user.save()
  res.json({ success: true, message: 'Default address updated', addresses: user.addresses })
}

/* ── POST /api/profile/image ─────────────────────────────────────────────────── */

exports.uploadProfileImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No image file provided' })

  const user = await User.findById(req.user._id).select('profileImage')
  if (!user) return res.status(404).json({ success: false, error: 'User not found' })

  if (user.profileImage) {
    const match = user.profileImage.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i)
    const publicId = match ? match[1] : null
    if (publicId) await cloudinary.uploader.destroy(publicId).catch(() => {})
  }

  user.profileImage = req.file.path
  await user.save({ validateBeforeSave: false })
  res.json({ success: true, message: 'Profile picture updated', profileImage: user.profileImage })
}

/* ── DELETE /api/profile/image ───────────────────────────────────────────────── */

exports.deleteProfileImage = async (req, res) => {
  const user = await User.findById(req.user._id).select('profileImage')
  if (!user) return res.status(404).json({ success: false, error: 'User not found' })
  if (!user.profileImage) return res.status(400).json({ success: false, error: 'No profile picture to delete' })

  const match = user.profileImage.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i)
  const publicId = match ? match[1] : null
  if (publicId) await cloudinary.uploader.destroy(publicId).catch(() => {})

  user.profileImage = null
  await user.save({ validateBeforeSave: false })
  res.json({ success: true, message: 'Profile picture removed' })
}
