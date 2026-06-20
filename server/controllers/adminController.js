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
    topSellingProducts,
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
    Order.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          image: { $first: '$items.image' },
          unitsSold: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
          orderCount: { $addToSet: '$_id' },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          productId: '$_id',
          name: { $ifNull: ['$product.name', '$name'] },
          image: { $ifNull: [{ $arrayElemAt: ['$product.images.url', 0] }, '$image'] },
          unitsSold: 1,
          revenue: 1,
          stock: '$product.stock',
          orderCount: { $size: '$orderCount' },
        },
      },
      { $sort: { unitsSold: -1, revenue: -1 } },
      { $limit: 10 },
    ]),
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
    topSellingProducts,
    totalCategories,
  })
}
