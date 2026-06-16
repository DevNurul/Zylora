const router = require('express').Router()
const authenticateUser = require('../middleware/authenticateUser')
const authorizeAdmin   = require('../middleware/authorizeAdmin')
const { productUpload, bannerUpload, categoryUpload } = require('../middleware/uploadMiddleware')

const productCtrl = require('../controllers/productController')
const orderCtrl = require('../controllers/orderController')
const categoryCtrl = require('../controllers/categoryController')
const bannerCtrl = require('../controllers/bannerController')
const couponCtrl = require('../controllers/couponController')
const settingsCtrl = require('../controllers/settingsController')
const adminCtrl       = require('../controllers/adminController')
const adminReturnCtrl = require('../controllers/adminReturnController')
const walletCtrl      = require('../controllers/walletController')

// All admin routes require auth
router.use(authenticateUser)
router.use(authorizeAdmin)

// Dashboard
router.get('/dashboard', adminCtrl.getDashboard)

// Products
router.get('/products', productCtrl.adminGetProducts)
router.post('/products', productUpload, productCtrl.createProduct)
router.put('/products/:id', productUpload, productCtrl.updateProduct)
router.delete('/products/:id', productCtrl.deleteProduct)
router.patch('/products/:id/toggle', productCtrl.toggleProductActive)

// Orders
router.get('/orders', orderCtrl.adminGetOrders)
router.get('/orders/:orderId', orderCtrl.adminGetOrder)
router.patch('/orders/:orderId/status', orderCtrl.updateOrderStatus)
router.delete('/orders/:orderId', orderCtrl.deleteOrder)

// Categories
router.get('/categories', categoryCtrl.adminGetCategories)
router.post('/categories', categoryUpload, categoryCtrl.createCategory)
router.put('/categories/:id', categoryUpload, categoryCtrl.updateCategory)
router.delete('/categories/:id', categoryCtrl.deleteCategory)

// Banners
router.get('/banners', bannerCtrl.adminGetBanners)
router.post('/banners', bannerUpload, bannerCtrl.createBanner)
router.put('/banners/:id', bannerUpload, bannerCtrl.updateBanner)
router.delete('/banners/:id', bannerCtrl.deleteBanner)
router.patch('/banners/:id/toggle', bannerCtrl.toggleBanner)

// Coupons
router.get('/coupons', couponCtrl.adminGetCoupons)
router.post('/coupons', couponCtrl.createCoupon)
router.put('/coupons/:id', couponCtrl.updateCoupon)
router.delete('/coupons/:id', couponCtrl.deleteCoupon)
router.patch('/coupons/:id/toggle', couponCtrl.toggleCoupon)

// Settings
router.get('/settings', settingsCtrl.adminGetSettings)
router.put('/settings', settingsCtrl.updateSettings)

// Returns & Exchanges
router.get   ('/returns',                        adminReturnCtrl.getAllReturns)
router.get   ('/returns/:returnId',              adminReturnCtrl.getReturnById)
router.patch ('/returns/:returnId/status',       adminReturnCtrl.updateReturnStatus)

// Wallet management
router.get   ('/wallet/pending',                 walletCtrl.getPendingWalletCredits)
router.patch ('/wallet/:userId/approve',         walletCtrl.approveWalletCredit)
router.patch ('/wallet/:userId/reject',          walletCtrl.rejectWalletCredit)

module.exports = router
