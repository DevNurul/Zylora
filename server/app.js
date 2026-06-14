require('dotenv').config()
require('express-async-errors')

/* ── Startup env-var guard ───────────────────────────────────────────────────── */
const REQUIRED_ENV = [
  'MONGODB_URI',
  'JWT_SECRET',
]
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[startup] Missing required environment variable: ${key}`)
    process.exit(1)
  }
}

const express     = require('express')
const cors        = require('cors')
const helmet      = require('helmet')
const morgan      = require('morgan')
const compression = require('compression')
const rateLimit   = require('express-rate-limit')

const errorHandler = require('./middleware/errorHandler')

// Routes
const authRoutes     = require('./routes/authRoutes')
const productRoutes  = require('./routes/productRoutes')
const orderRoutes    = require('./routes/orderRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const bannerRoutes   = require('./routes/bannerRoutes')
const couponRoutes   = require('./routes/couponRoutes')
const settingsRoutes = require('./routes/settingsRoutes')
const adminRoutes    = require('./routes/adminRoutes')
const paymentRoutes  = require('./routes/paymentRoutes')
const wishlistRoutes = require('./routes/wishlistRoutes')
const profileRoutes       = require('./routes/profileRoutes')
const customerOrderRoutes = require('./routes/customerOrderRoutes')
const returnRoutes        = require('./routes/returnRoutes')
const walletRoutes        = require('./routes/walletRoutes')

const app = express()

// Trust the first proxy hop (Nginx, load balancer) so req.ip reflects the
// real client IP rather than the proxy IP — required for correct rate limiting.
app.set('trust proxy', 1)

// Security headers
app.use(helmet())

// In production CLIENT_URL must be set explicitly — never fall back to localhost.
if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_URL) {
  console.error('[startup] CLIENT_URL must be set in production to configure CORS correctly.')
  process.exit(1)
}

const allowedOrigins = [
  'http://amrin.co.in',
  'https://amrin.co.in',
  'http://admin.amrin.co.in',
  'https://admin.amrin.co.in',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true)
    const isLocal = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')
    if (isLocal || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: false,
}))

app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

// General rate limiter — 100 req / 15 min per IP
const generalLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, error: 'Too many requests, please try again later.' },
})

// Stricter limiter for order creation — 10 per hour
const orderLimiter = rateLimit({
  windowMs:        60 * 60 * 1000,
  max:             10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, error: 'Too many orders placed. Please wait before trying again.' },
})

app.use(generalLimiter)

// Stricter limiter for search suggestions — 60 per minute
const suggestionsLimiter = rateLimit({
  windowMs:        60 * 1000,
  max:             60,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, error: 'Too many requests' },
})
app.use('/api/products/suggestions', suggestionsLimiter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date() })
})

// Mount routes
app.use('/api/auth',       authRoutes)
app.use('/api/products',   productRoutes)
app.use('/api/orders',     orderLimiter)
app.use('/api/orders',     orderRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/banners',    bannerRoutes)
app.use('/api/coupons',    couponRoutes)
app.use('/api/settings',   settingsRoutes)
app.use('/api/admin',      adminRoutes)
app.use('/api/payment',    paymentRoutes)
app.use('/api/wishlist',   wishlistRoutes)
app.use('/api/profile',    profileRoutes)
app.use('/api/my-orders', customerOrderRoutes)
app.use('/api/returns',  returnRoutes)
app.use('/api/wallet',   walletRoutes)

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` })
})

// Global error handler
app.use(errorHandler)

module.exports = app
