require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/User')

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'tofilerana905@gmail.com'

async function main() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  const existing = await User.findOne({ email: ADMIN_EMAIL })

  if (existing) {
    if (existing.role === 'admin') {
      console.log(`✅ ${ADMIN_EMAIL} is already an admin — nothing changed.`)
    } else {
      existing.role = 'admin'
      await existing.save({ validateBeforeSave: false })
      console.log(`✅ Updated ${ADMIN_EMAIL} → role: admin`)
    }
  } else {
    await User.create({
      name:     'Admin',
      email:    ADMIN_EMAIL,
      phone:    '0000000000',
      password: 'AdminAmrin@123',
      role:     'admin',
    })
    console.log(`✅ Created new admin user: ${ADMIN_EMAIL}`)
  }

  await mongoose.disconnect()
  process.exit(0)
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
