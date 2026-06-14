const mongoose  = require('mongoose')
const generateReturnId = require('../utils/generateReturnId')

const returnSchema = new mongoose.Schema({
  returnId: { type: String, unique: true },

  orderId: { type: String, required: true, index: true },

  customerEmail: { type: String, required: true, lowercase: true, index: true },
  customerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  type: { type: String, enum: ['return', 'exchange'], required: true },

  items: [{
    productId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:         String,
    image:        String,
    price:        Number,
    orderedSize:  String,
    orderedColor: String,
    qty:          Number,
    reason:       { type: String, required: true },
    exchangeSize: String,
  }],

  comment: { type: String, maxlength: 500 },

  status: {
    type: String,
    enum: [
      'requested', 'approved', 'rejected',
      'payment_pending',
      'pickup_scheduled', 'item_received',
      'refund_approved', 'refund_rejected', 'refund_processed',
      'exchange_dispatched', 'exchange_delivered',
      'cancelled',
    ],
    default: 'requested',
    index: true,
  },

  // Rejection metadata
  rejectionType:        { type: String, enum: ['soft', 'hard'], default: null },
  resubmissionAllowed:  { type: Boolean, default: false },
  resubmissionCount:    { type: Number, default: 0, max: 1 },
  originalReturnId:     { type: String, default: null },

  // Refund method
  refundMethod: { type: String, enum: ['bank_transfer', 'wallet'], default: null },
  bankDetails: {
    accountHolderName: String,
    accountNumber:     String,
    ifscCode:          String,
    bankName:          String,
  },
  walletCreditAmount: { type: Number, default: 0 },

  // Exchange type & replacement product
  exchangeType: {
    type:    String,
    enum:    ['same_product', 'different_product'],
    default: 'same_product',
  },
  newProduct: {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:  String,
    image: String,
    price: Number,
    size:  String,
    color: String,
  },

  // Price difference for different-product exchange
  priceDifference: { type: Number, default: 0 },
  priceDifferencePayment: {
    status: {
      type:    String,
      enum:    ['not_required', 'pending', 'paid', 'failed'],
      default: 'not_required',
    },
    transactionId: String,  // PhonePe merchantTransactionId (RETDIFF_xxx)
    amount:  Number,
    paidAt:  Date,
  },

  refundAmount:            { type: Number, default: 0 },
  refundReference:         { type: String },
  exchangeTrackingNumber:  { type: String },
  adminNote:               { type: String },
  internalNote:            { type: String },
  pickupDate:              { type: Date },

  statusHistory: [{
    status:    String,
    timestamp: { type: Date, default: Date.now },
    note:      String,
    updatedBy: { type: String, enum: ['customer', 'admin'], default: 'admin' },
  }],

  createdAt: { type: Date, default: Date.now },
})

returnSchema.pre('save', function () {
  if (!this.returnId) this.returnId = generateReturnId()
})

module.exports = mongoose.model('Return', returnSchema)
