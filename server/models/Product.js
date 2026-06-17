const mongoose = require('mongoose')
const { generateVariantSkuMap } = require('../utils/generateSku')

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images: [{ url: String, publicId: String }],
  sizes: [{ type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] }],
  colors: [String],
  variantSkuMap: { type: Map, of: String, default: {} },
  stock: { type: Number, default: 0 },
  sizeStock: { type: Map, of: Number, default: {} },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  isSale: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
}, {
  suppressReservedKeysWarning: true
})

productSchema.pre('save', async function () {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  if (!this.variantSkuMap || this.variantSkuMap.size === 0) {
    const Category = mongoose.model('Category')
    const category = await Category.findById(this.category).lean()
    const categoryName = category ? category.name : 'Item'
    const map = generateVariantSkuMap(categoryName, this.colors, this.sizes)
    this.variantSkuMap = map
  }
})

module.exports = mongoose.model('Product', productSchema)
