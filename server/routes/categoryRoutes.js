const router = require('express').Router()
const ctrl = require('../controllers/categoryController')

router.get('/', ctrl.getCategories)
router.get('/:slug', ctrl.getCategoryBySlug)

module.exports = router
