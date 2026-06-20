const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: String,
  description: String,
  image: {
    url: { type: String, required: true },
    publicId: String,
  },
  ctaText: String,
  ctaLink: String,
  placement: { type: String, enum: ['hero', 'promotional'], default: 'hero' },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Banner', bannerSchema)
