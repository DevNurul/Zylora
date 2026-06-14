require('dotenv').config()
const app = require('./app')
const connectDB = require('./config/db')

const PORT = process.env.PORT || 5000

if (!process.env.ADMIN_SECRET_KEY) {
  console.warn('WARNING: ADMIN_SECRET_KEY is not set — all admin routes are unprotected!')
}

const start = async () => {
  await connectDB()

  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`)
    console.log(`Server URL: http://localhost:${PORT}`)
    console.log(`API Base:   http://localhost:${PORT}/api`)
  })

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message)
    server.close(() => process.exit(1))
  })

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message)
    process.exit(1)
  })
}

start()
