const router = require('express').Router()
const { phonePeCallback, verifyPayment } = require('../controllers/paymentController')

// PhonePe S2S callback — no rate limit applied (this route is mounted outside orderLimiter)
router.post('/callback', phonePeCallback)

// Frontend polls this after PhonePe redirect to get the final payment status
router.get('/verify/:transactionId', verifyPayment)

module.exports = router
