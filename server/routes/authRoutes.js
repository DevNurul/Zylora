const router          = require('express').Router()
const rateLimit       = require('express-rate-limit')
const auth            = require('../controllers/authController')
const authenticateUser = require('../middleware/authenticateUser')

const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, error: 'Too many attempts. Please try again in 15 minutes.' },
})

const otpVerifyLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, error: 'Too many OTP verification attempts. Please try again later.' },
})

router.post('/register',   authLimiter,      auth.register)
router.post('/login',      authLimiter,      auth.login)
router.post('/send-otp',   authLimiter,      auth.sendOTP)
router.post('/verify-otp', otpVerifyLimiter, auth.verifyOTP)
router.post('/logout',                       auth.logout)
router.get ('/me',         authenticateUser, auth.getMe)

module.exports = router
