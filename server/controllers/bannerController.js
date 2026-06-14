const Banner = require('../models/Banner')
const { cloudinary } = require('../config/cloudinary')

exports.getBanners = async (req, res) => {
  const now = new Date()
  const banners = await Banner.find({
    isActive: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
  }).sort({ displayOrder: 1 })

  res.json({ success: true, count: banners.length, banners })
}

// ─── Admin ────────────────────────────────────────────────────────────────────

exports.adminGetBanners = async (req, res) => {
  const banners = await Banner.find().sort({ displayOrder: 1 })
  res.json({ success: true, count: banners.length, banners })
}

exports.createBanner = async (req, res) => {
  let image
  if (req.file) {
    image = { url: req.file.path, publicId: req.file.filename }
  } else if (req.body.imageUrl?.trim()) {
    image = { url: req.body.imageUrl.trim() }
  } else {
    return res.status(400).json({ success: false, error: 'Banner image is required' })
  }
  delete req.body.imageUrl
  const banner = await Banner.create({ ...req.body, image })
  res.status(201).json({ success: true, banner })
}

exports.updateBanner = async (req, res) => {
  const banner = await Banner.findById(req.params.id)
  if (!banner) return res.status(404).json({ success: false, error: 'Banner not found' })

  if (req.file) {
    if (banner.image?.publicId) {
      await cloudinary.uploader.destroy(banner.image.publicId).catch(() => {})
    }
    req.body.image = { url: req.file.path, publicId: req.file.filename }
  } else if (req.body.imageUrl?.trim()) {
    if (banner.image?.publicId) {
      await cloudinary.uploader.destroy(banner.image.publicId).catch(() => {})
    }
    req.body.image = { url: req.body.imageUrl.trim() }
  }
  delete req.body.imageUrl

  const updated = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json({ success: true, banner: updated })
}

exports.deleteBanner = async (req, res) => {
  const banner = await Banner.findById(req.params.id)
  if (!banner) return res.status(404).json({ success: false, error: 'Banner not found' })

  if (banner.image?.publicId) {
    await cloudinary.uploader.destroy(banner.image.publicId).catch(() => {})
  }
  await banner.deleteOne()
  res.json({ success: true, message: 'Banner deleted' })
}

exports.toggleBanner = async (req, res) => {
  const banner = await Banner.findById(req.params.id)
  if (!banner) return res.status(404).json({ success: false, error: 'Banner not found' })
  banner.isActive = !banner.isActive
  await banner.save()
  res.json({ success: true, isActive: banner.isActive })
}
