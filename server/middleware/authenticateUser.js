const { verifyToken } = require('../utils/jwt')
const User = require('../models/User')

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required' })
  }

  const token = authHeader.slice(7)

  try {
    const decoded = verifyToken(token)
    const user    = await User.findById(decoded.userId).select('-otp')
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' })
    }
    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired', code: 'TOKEN_EXPIRED' })
    }
    return res.status(401).json({ success: false, error: 'Invalid token' })
  }
}

module.exports = authenticateUser
