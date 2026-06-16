const nodemailer = require('nodemailer')

const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtpout.secureserver.net'
const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT) || 465
const secure = port === 465 || process.env.SMTP_SECURE === 'true'

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user: process.env.EMAIL_USER || process.env.SMTP_USER,
    pass: process.env.EMAIL_PASS || process.env.SMTP_PASS,
  },
})

module.exports = transporter
