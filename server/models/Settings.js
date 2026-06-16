const mongoose = require('mongoose')

const settingsSchema = new mongoose.Schema({
  storeName: { type: String, default: 'Zylara' },
  storeLogo: { url: String, publicId: String },
  tagline: String,
  contactEmail: String,
  contactPhone: String,
  address: String,
  socialLinks: {
    instagram: String,
    facebook: String,
    twitter: String,
  },
  shippingCharge: { type: Number, default: 99 },
  freeShippingThreshold: { type: Number, default: 999 },
  currency: { type: String, default: 'INR' },
  isMaintenanceMode: { type: Boolean, default: false },
})

module.exports = mongoose.model('Settings', settingsSchema)
