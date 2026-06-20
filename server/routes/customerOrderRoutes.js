const router           = require('express').Router()
const ctrl             = require('../controllers/customerOrderController')
const authenticateUser = require('../middleware/authenticateUser')

router.use(authenticateUser)

router.get('/',                        ctrl.getMyOrders)
router.get('/:orderId',                ctrl.getMyOrderById)
router.patch('/:orderId/cancel',       ctrl.cancelMyOrder)
router.get('/:orderId/invoice',        ctrl.downloadInvoice)
router.get('/:orderId/address-label',  ctrl.downloadAddressLabel)
router.get('/:orderId/print',          ctrl.downloadCombined)

module.exports = router
