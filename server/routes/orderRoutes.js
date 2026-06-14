const router = require('express').Router()
const { body } = require('express-validator')
const ctrl = require('../controllers/orderController')
const validate = require('../middleware/validateRequest')

const orderValidation = [
  body('customerName').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit Indian phone number required'),
  body('shippingAddress.addressLine1').notEmpty().withMessage('Address line 1 is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.pincode').matches(/^\d{6}$/).withMessage('Valid 6-digit pincode required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('paymentMethod').isIn(['COD', 'ONLINE']).withMessage('Payment method must be COD or ONLINE'),
]

router.post('/', orderValidation, validate, ctrl.createOrder)
router.get('/track', ctrl.trackOrder)
router.post('/validate-coupon', ctrl.validateCoupon)

module.exports = router
