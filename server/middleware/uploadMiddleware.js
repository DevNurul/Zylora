const { productUpload, bannerUpload, categoryUpload, profileUpload } = require('../config/cloudinary')

// Wrap multer callbacks in promises for use with express-async-errors
const promisify = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err) return next(err)
    next()
  })
}

module.exports = {
  productUpload: promisify(productUpload),
  bannerUpload: promisify(bannerUpload),
  categoryUpload: promisify(categoryUpload),
  profileUpload: promisify(profileUpload),
}
