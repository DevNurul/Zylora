const Settings = require('../models/Settings')

const PUBLIC_FIELDS = 'storeName tagline contactEmail contactPhone address socialLinks shippingCharge freeShippingThreshold currency isMaintenanceMode'

exports.getSettings = async (req, res) => {
  let settings = await Settings.findOne().select(PUBLIC_FIELDS)
  if (!settings) {
    settings = {
      storeName: 'Zylara',
      tagline: 'Fashion & Style',
      shippingCharge: 99,
      freeShippingThreshold: 999,
      currency: 'INR',
      isMaintenanceMode: false,
    }
  }
  res.json({ success: true, settings })
}

exports.adminGetSettings = async (req, res) => {
  let settings = await Settings.findOne()
  if (!settings) settings = await Settings.create({})
  res.json({ success: true, settings })
}

exports.updateSettings = async (req, res) => {
  const settings = await Settings.findOneAndUpdate({}, req.body, {
    returnDocument: 'after',
    upsert: true,
    runValidators: true,
  })
  res.json({ success: true, settings })
}
