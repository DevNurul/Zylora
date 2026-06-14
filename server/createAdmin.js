require('dotenv').config()
const connectDB = require('./config/db')
const User = require('./models/User')

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'amrin.official26@gmail.com'
const ADMIN_NAME  = process.env.ADMIN_NAME  || 'AMRIN Admin'
const ADMIN_PHONE = process.env.ADMIN_PHONE || '9999999999'
const ADMIN_PASS  = process.env.ADMIN_PASS  || 'Admin@123'

const run = async () => {
  await connectDB()

  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() })
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin'
      await existing.save({ validateBeforeSave: false })
      console.log(`Updated existing user to admin: ${ADMIN_EMAIL}`)
    } else {
      console.log(`Admin already exists: ${ADMIN_EMAIL}`)
    }
    process.exit(0)
  }

  await User.create({
    name:     ADMIN_NAME,
    email:    ADMIN_EMAIL,
    phone:    ADMIN_PHONE,
    password: ADMIN_PASS,
    role:     'admin',
  })

  console.log(`Admin user created: ${ADMIN_EMAIL}`)
  process.exit(0)
}

run().catch((err) => {
  console.error('Failed:', err.message)
  process.exit(1)
})
