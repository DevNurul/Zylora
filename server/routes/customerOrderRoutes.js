const router           = require('express').Router()
const ctrl             = require('../controllers/customerOrderController')
const authenticateUser = require('../middleware/authenticateUser')

router.use(authenticateUser)

router.get('/',          ctrl.getMyOrders)
router.get('/:orderId',  ctrl.getMyOrderById)

module.exports = router
