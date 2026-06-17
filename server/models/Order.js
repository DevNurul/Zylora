const mongoose = require('mongoose')
const generateOrderId = require('../utils/generateOrderId')

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  customerName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String, required: true },
  shippingAddress: {
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
  },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    image: String,
    sku: String,
    price: Number,
    size: String,
    color: String,
    qty:          Number,
    exchangeUsed: { type: Boolean, default: false },
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  couponCode: { type: String },
  shippingCharge: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['COD', 'ONLINE'],
    default: 'COD',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending',
  },
  trackingNumber: { type: String },
  phonePeTransactionId: { type: String, index: true },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
  }],
  createdAt: { type: Date, default: Date.now },
})

orderSchema.pre('save', async function () {
  if (!this.orderId) {
    this.orderId = generateOrderId()
  }
})

module.exports = mongoose.model('Order', orderSchema)
