const router = require('express').Router()
const ctrl = require('../controllers/bannerController')

router.get('/', ctrl.getBanners)

module.exports = router
