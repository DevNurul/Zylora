const Order = require('../models/Order')
const Product = require('../models/Product')
const Category = require('../models/Category')

exports.getDashboard = async (req, res) => {
  const [
    totalOrders,
    totalProducts,
    totalCategories,
    statusCounts,
    revenueResult,
    recentOrders,
    lowStockProducts,
  ] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Category.countDocuments({ isActive: true }),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(5),
    Product.find({ stock: { $lt: 5 }, isActive: true })
      .select('name stock images')
      .limit(10),
  ])

  const ordersByStatus = {
    pending: 0,
    confirmed: 0,
    shipped: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
  }
  statusCounts.forEach(({ _id, count }) => {
    if (_id in ordersByStatus) ordersByStatus[_id] = count
  })

  res.json({
    success: true,
    totalOrders,
    totalRevenue: revenueResult[0]?.total || 0,
    ordersByStatus,
    recentOrders,
    totalProducts,
    lowStockProducts,
    totalCategories,
  })
}
