const crypto = require('crypto')

const BASE_URL = () => process.env.PHONEPE_API_URL || 'https://api-preprod.phonepe.com/apis/pg-sandbox'

function assertCredentials() {
  if (!process.env.PHONEPE_MERCHANT_ID) throw new Error('PHONEPE_MERCHANT_ID is not configured')
  if (!process.env.PHONEPE_SALT_KEY) throw new Error('PHONEPE_SALT_KEY is not configured')
}

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex')
}

function saltIndex() {
  return process.env.PHONEPE_SALT_INDEX || '1'
}

// Minimal fetch wrapper with timeout (requires Node 18+)
async function phonePeFetch(url, options) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    const data = await res.json()
    return data
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('PhonePe API request timed out')
    throw err
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Initiates a PhonePe standard checkout session.
 * Returns the raw PhonePe API response; caller checks .success and extracts redirectUrl.
 */
async function initiatePayment({ transactionId, amount, phone, redirectUrl, callbackUrl }) {
  assertCredentials()
  const mid = process.env.PHONEPE_MERCHANT_ID
  const saltKey = process.env.PHONEPE_SALT_KEY
  const idx = saltIndex()

  const payload = {
    merchantId: mid,
    merchantTransactionId: transactionId,
    merchantUserId: `MUID_${transactionId}`,
    amount: Math.round(amount * 100), // rupees → paise
    redirectUrl,
    redirectMode: 'REDIRECT',
    callbackUrl,
    mobileNumber: phone,
    paymentInstrument: { type: 'PAY_PAGE' },
  }

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64')
  const checksum = `${sha256(base64Payload + '/pg/v1/pay' + saltKey)}###${idx}`

  return phonePeFetch(`${BASE_URL()}/pg/v1/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
      Accept: 'application/json',
    },
    body: JSON.stringify({ request: base64Payload }),
  })
}

/**
 * Checks the status of a transaction with PhonePe.
 */
async function checkPaymentStatus(transactionId) {
  assertCredentials()
  const mid = process.env.PHONEPE_MERCHANT_ID
  const saltKey = process.env.PHONEPE_SALT_KEY
  const idx = saltIndex()
  const path = `/pg/v1/status/${mid}/${transactionId}`
  const checksum = `${sha256(path + saltKey)}###${idx}`

  return phonePeFetch(`${BASE_URL()}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
      'X-MERCHANT-ID': mid,
      Accept: 'application/json',
    },
  })
}

/**
 * Verifies the X-VERIFY signature from PhonePe's S2S callback.
 * Uses timing-safe comparison to prevent timing attacks.
 */
function verifyCallbackSignature(responseBase64, xVerifyHeader) {
  if (!xVerifyHeader || !xVerifyHeader.includes('###')) return false
  assertCredentials()
  const saltKey = process.env.PHONEPE_SALT_KEY
  const receivedHash = xVerifyHeader.split('###')[0]
  const expectedHash = sha256(responseBase64 + saltKey)
  if (receivedHash.length !== expectedHash.length) return false
  return crypto.timingSafeEqual(
    Buffer.from(expectedHash),
    Buffer.from(receivedHash)
  )
}

module.exports = { initiatePayment, checkPaymentStatus, verifyCallbackSignature }
