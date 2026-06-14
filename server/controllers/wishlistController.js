const User    = require('../models/User')
const Product = require('../models/Product')

/* GET /api/wishlist — returns the authenticated user's wishlist with populated products */
exports.getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    populate: { path: 'category', select: 'name' },
  })

  // Filter out any refs that no longer resolve (deleted products)
  const products = (user.wishlist || []).filter(Boolean)

  res.json({ success: true, products })
}

/* POST /api/wishlist/:productId — add a product to the wishlist (idempotent) */
exports.addToWishlist = async (req, res) => {
  const { productId } = req.params

  const product = await Product.findById(productId)
  if (!product || !product.isActive) {
    return res.status(404).json({ success: false, error: 'Product not found' })
  }

  await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishlist: productId } }
  )

  res.json({ success: true, message: 'Added to wishlist' })
}

/* DELETE /api/wishlist/:productId — remove a product from the wishlist */
exports.removeFromWishlist = async (req, res) => {
  const { productId } = req.params

  await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { wishlist: productId } }
  )

  res.json({ success: true, message: 'Removed from wishlist' })
}
