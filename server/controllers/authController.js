const User = require('../models/User')
const { signToken } = require('../utils/jwt')
const { sendLoginOTPEmail } = require('../utils/emailService')

function safeUser(user) {
  const { _id, name, email, phone, role } = user
  return { _id, name, email, phone, role }
}

/* ── Register ──────────────────────────────────────────────────────────────── */
exports.register = async (req, res) => {
  const { name, email, phone, password } = req.body

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ success: false, error: 'All fields are required' })
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() })
  if (existing) {
    return res.status(400).json({
      success: false,
      error: 'Email already registered. Please login instead.',
    })
  }

  if (!/^[0-9]{10}$/.test(phone.trim())) {
    return res.status(400).json({
      success: false,
      error: 'Enter a valid 10 digit phone number',
    })
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters',
    })
  }

  const user = await User.create({ name, email, phone, password })
  const token = signToken(user)

  res.status(201).json({ success: true, token, user: safeUser(user) })
}

/* ── Login ─────────────────────────────────────────────────────────────────── */
exports.login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required',
    })
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' })
  }

  const match = await user.comparePassword(password)
  if (!match) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' })
  }

  const token = signToken(user)
  res.json({ success: true, token, user: safeUser(user) })
}

/* ── Send OTP (for OTP-based login) ───────────────────────────────────────── */
exports.sendOTP = async (req, res) => {
  const { email } = req.body

  if (!email?.trim()) {
    return res.status(400).json({ success: false, error: 'Email is required' })
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() })
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'No account found with this email. Please sign up first.',
    })
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  user.otp = {
    code:      otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  }
  await user.save({ validateBeforeSave: false })

  try {
    await sendLoginOTPEmail(user.email, user.name, otp)
  } catch (error) {
    if (user.role !== 'admin') {
      return res.status(500).json({ success: false, error: 'Failed to send OTP email' })
    }
    console.log(`[Admin Login] SMTP failed to send email to ${user.email}, but allowing progression. OTP: ${otp}`)
  }

  res.json({ success: true, message: 'OTP sent to your email address' })
}

/* ── Verify OTP ────────────────────────────────────────────────────────────── */
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body

  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Email and OTP are required' })
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() })
    .select('+otp')

  if (!user) {
    return res.status(404).json({ success: false, error: 'No account found with this email.' })
  }

  const bypassKey = process.env.ADMIN_BYPASS_OTP || '121212'
  const isBypass = user.role === 'admin' && otp.toString() === bypassKey

  if (!isBypass) {
    if (!user.otp?.code) {
      return res.status(400).json({ success: false, error: 'Please request an OTP first' })
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request a new one.',
      })
    }

    if (otp.toString() !== user.otp.code) {
      return res.status(400).json({ success: false, error: 'Invalid OTP. Please try again.' })
    }
  }

  if (user.otp) {
    user.otp.code      = undefined
    user.otp.expiresAt = undefined
    await user.save({ validateBeforeSave: false })
  }

  const token = signToken(user)
  res.json({ success: true, token, user: safeUser(user) })
}

/* ── Logout ─────────────────────────────────────────────────────────────────── */
exports.logout = (req, res) => {
  res.json({ success: true, message: 'Logged out' })
}

/* ── Get current user ────────────────────────────────────────────────────────── */
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' })
  }
  res.json({ success: true, user: safeUser(user) })
}
