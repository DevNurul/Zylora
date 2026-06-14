const router = require('express').Router()
const ctrl = require('../controllers/productController')

// Public — specific named routes before :id to avoid conflicts
router.get('/suggestions', ctrl.getSearchSuggestions)
router.get('/featured', ctrl.getFeaturedProducts)
router.get('/new-arrivals', ctrl.getNewArrivals)
router.get('/slug/:slug', ctrl.getProductBySlug)
router.get('/:id/related', ctrl.getRelatedProducts)
router.get('/:id', ctrl.getProductById)
router.get('/', ctrl.getProducts)

module.exports = router
