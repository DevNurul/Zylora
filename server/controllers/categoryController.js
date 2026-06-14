const Category = require('../models/Category')
const Product = require('../models/Product')
const { cloudinary } = require('../config/cloudinary')

exports.getCategories = async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 })

  // Add product count per category
  const withCount = await Promise.all(
    categories.map(async (cat) => {
      const count = await Product.countDocuments({ category: cat._id, isActive: true })
      return { ...cat.toObject(), productCount: count }
    })
  )

  res.json({ success: true, count: withCount.length, categories: withCount })
}

exports.getCategoryBySlug = async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true })
  if (!category) return res.status(404).json({ success: false, error: 'Category not found' })
  res.json({ success: true, category })
}

// ─── Admin ────────────────────────────────────────────────────────────────────

exports.adminGetCategories = async (req, res) => {
  const categories = await Category.find().sort({ displayOrder: 1 })
  res.json({ success: true, count: categories.length, categories })
}

exports.createCategory = async (req, res) => {
  const data = { ...req.body }
  if (req.file) {
    data.image = { url: req.file.path, publicId: req.file.filename }
  }
  const category = await Category.create(data)
  res.status(201).json({ success: true, category })
}

exports.updateCategory = async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) return res.status(404).json({ success: false, error: 'Category not found' })

  if (req.file) {
    if (category.image?.publicId) {
      await cloudinary.uploader.destroy(category.image.publicId).catch(() => {})
    }
    req.body.image = { url: req.file.path, publicId: req.file.filename }
  }

  const updated = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  res.json({ success: true, category: updated })
}

exports.deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) return res.status(404).json({ success: false, error: 'Category not found' })

  const productCount = await Product.countDocuments({ category: req.params.id })
  if (productCount > 0) {
    return res.status(400).json({
      success: false,
      error: `Cannot delete category with ${productCount} existing product${productCount > 1 ? 's' : ''}`,
    })
  }

  if (category.image?.publicId) {
    await cloudinary.uploader.destroy(category.image.publicId).catch(() => {})
  }

  await category.deleteOne()
  res.json({ success: true, message: 'Category deleted' })
}
