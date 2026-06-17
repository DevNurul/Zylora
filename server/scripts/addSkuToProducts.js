require('dotenv').config()
const mongoose = require('mongoose')
const Product = require('../models/Product')
const Category = require('../models/Category')
const { generateVariantSkuMap } = require('../utils/generateSku')

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  const products = await Product.find({}).populate('category', 'name')
  let updated = 0

  for (const product of products) {
    if (product.variantSkuMap && product.variantSkuMap.size > 0) {
      continue
    }

    const categoryName = product.category?.name || 'Item'
    const map = generateVariantSkuMap(categoryName, product.colors, product.sizes)
    product.variantSkuMap = map
    await product.save()
    updated++
    console.log(`SKU added: ${product.name} (${Object.keys(map).length} variants)`)
  }

  console.log(`\nMigration complete. ${updated} products updated out of ${products.length} total.`)
  await mongoose.disconnect()
  process.exit(0)
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
