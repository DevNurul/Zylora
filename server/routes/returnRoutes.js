const router           = require('express').Router()
const ctrl             = require('../controllers/returnController')
const authenticateUser = require('../middleware/authenticateUser')

router.use(authenticateUser)

router.post ('/',                                   ctrl.submitRequest)
router.get  ('/my-requests',                        ctrl.getMyRequests)
router.get  ('/eligible-products',                  ctrl.getEligibleProducts)
// static paths before /:returnId
router.get  ('/verify-payment/:transactionId',      ctrl.verifyPayment)

router.get  ('/:returnId',                          ctrl.getRequestById)
router.patch('/:returnId/cancel',                   ctrl.cancelRequest)
router.post ('/:returnId/initiate-payment',         ctrl.initiatePayment)

module.exports = router
