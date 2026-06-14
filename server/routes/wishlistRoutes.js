const router   = require('express').Router()
const authenticateUser = require('../middleware/authenticateUser')
const wishlist = require('../controllers/wishlistController')

// All wishlist routes require authentication
router.use(authenticateUser)

router.get   ('/',             wishlist.getWishlist)
router.post  ('/:productId',  wishlist.addToWishlist)
router.delete('/:productId',  wishlist.removeFromWishlist)

module.exports = router
