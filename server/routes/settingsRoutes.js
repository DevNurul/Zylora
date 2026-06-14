const router = require('express').Router()
const ctrl = require('../controllers/settingsController')

router.get('/', ctrl.getSettings)

module.exports = router
