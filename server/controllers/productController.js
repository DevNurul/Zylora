const Product = require('../models/Product')
const APIFeatures = require('../utils/apiFeatures')
const { cloudinary } = require('../config/cloudinary')

// FormData sends everything as strings — coerce types before passing to Mongoose
function coerceProductBody(body) {
  try {
    if (typeof body.sizes === 'string') body.sizes = JSON.parse(body.sizes)
    if (typeof body.colors === 'string') body.colors = JSON.parse(body.colors)
    if (typeof body.tags === 'string') body.tags = JSON.parse(body.tags)
    if (typeof body.sizeStock === 'string') body.sizeStock = JSON.parse(body.sizeStock)
  } catch {
    throw Object.assign(new Error('Invalid JSON in sizes, colors, tags, or sizeStock field'), { statusCode: 400 })
  }
  // Empty string → remove so Mongoose uses default / skips optional field
  if (body.originalPrice === '' || body.originalPrice === undefined) delete body.originalPrice
  if (body.category === '') delete body.category
  // If sizeStock provided, compute total stock from it; otherwise fall back to stock field
  if (body.sizeStock && typeof body.sizeStock === 'object' && !Array.isArray(body.sizeStock)) {
    body.stock = Object.values(body.sizeStock).reduce((sum, qty) => sum + (Number(qty) || 0), 0)
  } else if (body.stock === '') {
    body.stock = 0
  }
  // Boolean strings from FormData
  ;['isFeatured', 'isNew', 'isActive', 'isSale'].forEach((key) => {
    if (body[key] !== undefined) body[key] = body[key] === 'true' || body[key] === true
  })
  return body
}

exports.getProducts = async (req, res) => {
  const baseQuery = Product.find({ isActive: true }).populate('category', 'name slug')
  const features = new APIFeatures(baseQuery, req.query)
    .filter()
    .search()
    .sort()

  // Count before pagination
  const countFeatures = new APIFeatures(
    Product.find({ isActive: true }),
    req.query
  ).filter().search()
  const total = await countFeatures.query.countDocuments()

  features.paginate()
  const products = await features.query

  const limit = Math.min(50, Number(req.query.limit) || 12)
  const currentPage = Math.max(1, Number(req.query.page) || 1)
  const totalPages = Math.ceil(total / limit)

  res.json({
    success: true,
    count: products.length,
    total,
    totalPages,
    currentPage,
    products,
  })
}

exports.getFeaturedProducts = async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .populate('category', 'name slug')
    .limit(8)
    .sort({ createdAt: -1 })
  res.json({ success: true, count: products.length, products })
}

exports.getNewArrivals = async (req, res) => {
  const products = await Product.find({ isNew: true, isActive: true })
    .populate('category', 'name slug')
    .limit(8)
    .sort({ createdAt: -1 })
  res.json({ success: true, count: products.length, products })
}

exports.getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug')
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' })
  const p = product.toObject({ flattenMaps: true })
  const sizeStockObj = p.sizeStock || {}
  const hasSizeStock = Object.keys(sizeStockObj).length > 0
  p.isOutOfStock = hasSizeStock ? Object.values(sizeStockObj).every((v) => v === 0) : p.stock === 0
  res.json({ success: true, product: p })
}

exports.getProductBySlug = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug')
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' })
  const p = product.toObject({ flattenMaps: true })
  const sizeStockObj = p.sizeStock || {}
  const hasSizeStock = Object.keys(sizeStockObj).length > 0
  p.isOutOfStock = hasSizeStock ? Object.values(sizeStockObj).every((v) => v === 0) : p.stock === 0
  res.json({ success: true, product: p })
}

exports.getRelatedProducts = async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' })

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .populate('category', 'name slug')
    .limit(4)

  res.json({ success: true, count: related.length, products: related })
}

exports.getSearchSuggestions = async (req, res) => {
  let { q } = req.query
  if (!q || q.trim().length < 3) {
    return res.status(400).json({ success: false, error: 'Query must be at least 3 characters' })
  }
  q = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const results = await Product.find({
    isActive: true,
    $or: [
      { name:        { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { tags:        { $regex: q, $options: 'i' } },
    ],
  })
    .populate('category', 'name slug')
    .select('name slug images price originalPrice category isSale isNew')
    .limit(8)
    .lean()

  const suggestions = results.map((p) => ({
    _id:           p._id,
    name:          p.name,
    slug:          p.slug,
    image:         p.images?.[0]?.url || null,
    price:         p.price,
    originalPrice: p.originalPrice,
    category:      p.category ? { name: p.category.name, slug: p.category.slug } : null,
    isSale:        p.isSale,
    isNew:         p.isNew,
  }))

  res.json({ success: true, suggestions, total: suggestions.length, query: q })
}

// ─── Admin ────────────────────────────────────────────────────────────────────

exports.adminGetProducts = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = 20
  const skip = (page - 1) * limit

  const filter = {}
  if (req.query.category) filter.category = req.query.category
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true'

  const total = await Product.countDocuments(filter)
  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  res.json({
    success: true,
    count: products.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    products,
  })
}

exports.createProduct = async (req, res) => {
  const images = (req.files || []).map((f) => ({
    url: f.path,
    publicId: f.filename,
  }))
  coerceProductBody(req.body)
  const product = await Product.create({ ...req.body, images })
  res.status(201).json({ success: true, product })
}

exports.updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' })

  // If new images uploaded, delete old ones from cloudinary
  if (req.files && req.files.length > 0) {
    for (const img of product.images) {
      if (img.publicId) {
        await cloudinary.uploader.destroy(img.publicId).catch(() => {})
      }
    }
    req.body.images = req.files.map((f) => ({ url: f.path, publicId: f.filename }))
  }

  coerceProductBody(req.body)

  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('category', 'name slug')

  res.json({ success: true, product: updated })
}

exports.deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' })

  for (const img of product.images) {
    if (img.publicId) {
      await cloudinary.uploader.destroy(img.publicId).catch(() => {})
    }
  }

  await product.deleteOne()
  res.json({ success: true, message: 'Product deleted' })
}

exports.toggleProductActive = async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' })

  product.isActive = !product.isActive
  await product.save()

  res.json({ success: true, message: `Product ${product.isActive ? 'activated' : 'deactivated'}`, isActive: product.isActive })
}
