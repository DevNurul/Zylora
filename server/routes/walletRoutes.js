const router           = require('express').Router()
const ctrl             = require('../controllers/walletController')
const authenticateUser = require('../middleware/authenticateUser')

router.use(authenticateUser)

router.get  ('/',       ctrl.getWallet)
router.post ('/apply',  ctrl.applyWallet)

module.exports = router
