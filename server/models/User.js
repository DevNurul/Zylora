const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const otpSchema = new mongoose.Schema(
  {
    code:      { type: String },
    expiresAt: { type: Date },
  },
  { _id: false }
)

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  otp: {
    type:    otpSchema,
    select:  false,
    default: undefined,
  },
  role: {
    type: String,
    default: 'user',
  },
  isActive: {
    type: Boolean,
    default: true,
  },

  // Profile fields (kept for existing profile/order features)
  profileImage:   { type: String, default: null },
  addressLine1:   { type: String, trim: true, default: '' },
  addressLine2:   { type: String, trim: true, default: '' },
  city:           { type: String, trim: true, default: '' },
  state:          { type: String, trim: true, default: '' },
  postalCode:     { type: String, trim: true, default: '' },
  country:        { type: String, trim: true, default: '' },
  alternatePhone: { type: String, trim: true, default: '' },

  addresses: [
    {
      label: {
        type: String,
        enum: ['Home', 'Work', 'Other'],
        default: 'Home',
      },
      fullName:     { type: String, required: true, trim: true },
      phone:        { type: String, required: true, trim: true },
      addressLine1: { type: String, required: true, trim: true },
      addressLine2: { type: String, trim: true, default: '' },
      city:         { type: String, required: true, trim: true },
      state:        { type: String, required: true, trim: true },
      pincode:      { type: String, required: true, trim: true },
      isDefault:    { type: Boolean, default: false },
    },
  ],

  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  wallet: {
    balance: { type: Number, default: 0, min: 0 },
    transactions: [{
      type: {
        type: String,
        enum: ['credit', 'debit', 'expired'],
      },
      amount:      { type: Number },
      bonusAmount: { type: Number, default: 0 },
      description: String,
      returnId:    String,
      orderId:     String,
      status: {
        type:    String,
        enum:    ['pending', 'approved', 'rejected', 'expired'],
        default: 'pending',
      },
      expiresAt: Date,
      createdAt: { type: Date, default: Date.now },
    }],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
})

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', userSchema)
