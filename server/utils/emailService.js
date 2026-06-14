const nodemailer = require('nodemailer')

/* ── Brevo SMTP transporter ─────────────────────────────────────────────────── */
let transporter = null

function getTransporter() {
  if (transporter) return transporter

  transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST || 'smtp.hostinger.com',
    port:   Number(process.env.SMTP_PORT) || 465,
    secure: Number(process.env.SMTP_PORT) === 465 || process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  return transporter
}

/* ── HTML email templates ────────────────────────────────────────────────────── */
const BRAND  = process.env.FROM_NAME  || 'AMRIN Fashion'
const LOGO   = process.env.BRAND_LOGO || 'AMRIN'
const YEAR   = new Date().getFullYear()

function baseLayout(body) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body{margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif}
    .wrap{max-width:480px;margin:40px auto;background:#fff;border:1px solid #e5e7eb}
    .hdr{background:#0A0A0A;padding:28px;text-align:center}
    .logo{color:#fff;font-size:22px;letter-spacing:8px;font-weight:300}
    .body{padding:36px 32px}
    .otp-box{background:#f9f9f9;border:2px dashed #C9A96E;border-radius:4px;padding:24px;text-align:center;margin:24px 0}
    .otp{font-size:38px;font-weight:700;letter-spacing:12px;color:#0A0A0A;font-family:monospace}
    .expiry{color:#9CA3AF;font-size:12px;margin-top:8px}
    .ftr{background:#f9f9f9;padding:16px 32px;text-align:center;font-size:11px;color:#9CA3AF;border-top:1px solid #e5e7eb}
    h2{color:#0A0A0A;font-size:17px;font-weight:600;margin:0 0 10px}
    p{color:#6B6B6B;font-size:13px;line-height:1.7;margin:0 0 8px}
    .warn{color:#9CA3AF;font-size:11px;margin-top:16px}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr"><span class="logo">${LOGO}</span></div>
    <div class="body">${body}</div>
    <div class="ftr">&copy; ${YEAR} ${BRAND}. All rights reserved.</div>
  </div>
</body>
</html>`
}

function otpBody(otp, title, desc) {
  return `<h2>${title}</h2>
<p>${desc}</p>
<div class="otp-box">
  <div class="otp">${otp}</div>
  <div class="expiry">Valid for 10 minutes &nbsp;·&nbsp; Do not share this code</div>
</div>
<p class="warn">If you did not request this, please ignore this email.</p>`
}

/* ── Send OTP email ──────────────────────────────────────────────────────────── */
const OTP_CONFIG = {
  'verify-email': {
    subject: `Verify your email — ${BRAND}`,
    title:   'Email Verification',
    desc:    'Use the code below to verify your email address and complete registration.',
  },
  'login': {
    subject: `Your login code — ${BRAND}`,
    title:   'Passwordless Login',
    desc:    'Use the code below to sign in to your account.',
  },
  'forgot-password': {
    subject: `Reset your password — ${BRAND}`,
    title:   'Password Reset',
    desc:    'Use the code below to reset your password.',
  },
}

async function sendOTPEmail(to, otp, purpose) {
  const cfg = OTP_CONFIG[purpose]
  if (!cfg) throw new Error(`Unknown OTP purpose: ${purpose}`)

  const from = `"${BRAND}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`

  await getTransporter().sendMail({
    from,
    to,
    subject: cfg.subject,
    html:    baseLayout(otpBody(otp, cfg.title, cfg.desc)),
  })
}

/* ── Login OTP email (personalized) ─────────────────────────────────────────── */
async function sendLoginOTPEmail(to, name, otp) {
  const brand = process.env.FROM_NAME || 'AMRIN Fashion'
  const from  = `"${brand}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`
  const year  = new Date().getFullYear()

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body{margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif}
    .wrap{max-width:480px;margin:40px auto;background:#fff;border:1px solid #e5e7eb}
    .hdr{background:#0A0A0A;padding:28px;text-align:center}
    .logo{color:#fff;font-size:22px;letter-spacing:8px;font-weight:300}
    .body{padding:36px 32px}
    .otp-box{background:#f9f9f9;border:2px dashed #C9A96E;border-radius:4px;padding:24px;text-align:center;margin:24px 0}
    .otp{font-size:38px;font-weight:700;letter-spacing:12px;color:#0A0A0A;font-family:monospace}
    .expiry{color:#9CA3AF;font-size:12px;margin-top:8px}
    .ftr{background:#f9f9f9;padding:16px 32px;text-align:center;font-size:11px;color:#9CA3AF;border-top:1px solid #e5e7eb}
    h2{color:#0A0A0A;font-size:17px;font-weight:600;margin:0 0 10px}
    p{color:#6B6B6B;font-size:13px;line-height:1.7;margin:0 0 8px}
    .warn{color:#9CA3AF;font-size:11px;margin-top:16px}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr"><span class="logo">AMRIN</span></div>
    <div class="body">
      <h2>Your One-Time Password</h2>
      <p>Hello ${name},</p>
      <p>Your One-Time Password is:</p>
      <div class="otp-box">
        <div class="otp">${otp}</div>
        <div class="expiry">This OTP is valid for 10 minutes only</div>
      </div>
      <p class="warn">If you did not request this, please ignore this email.</p>
    </div>
    <div class="ftr">&copy; ${year} ${brand} &nbsp;&middot;&nbsp; ${process.env.FROM_EMAIL || process.env.SMTP_USER || ''}</div>
  </div>
</body>
</html>`

  await getTransporter().sendMail({
    from,
    to,
    subject: 'Your AMRIN Login OTP',
    html,
  })
}

/* ── Return confirmation email ───────────────────────────────────────────────── */
async function sendReturnConfirmationEmail(ret) {
  const brand    = process.env.FROM_NAME  || 'AMRIN Fashion'
  const from     = `"${brand}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`
  const year     = new Date().getFullYear()
  const typeLabel = ret.type === 'return' ? 'REFUND REQUEST' : 'EXCHANGE REQUEST'
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

  const itemsRows = ret.items.map((i) => `
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:10px 12px;font-size:13px;">${i.name}</td>
      <td style="padding:10px 12px;font-size:13px;text-align:center;">${i.orderedSize}</td>
      <td style="padding:10px 12px;font-size:13px;text-align:center;">${i.qty}</td>
      <td style="padding:10px 12px;font-size:13px;text-align:right;">₹${(i.price * i.qty).toLocaleString('en-IN')}</td>
      ${ret.type === 'exchange' ? `<td style="padding:10px 12px;font-size:13px;text-align:center;color:#1d4ed8;">→ ${i.exchangeSize}</td>` : ''}
    </tr>`).join('')

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>body{margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif}
.wrap{max-width:560px;margin:32px auto;background:#fff;border:1px solid #e5e7eb}
.hdr{background:#0A0A0A;padding:28px;text-align:center}
.logo{color:#fff;font-size:22px;letter-spacing:8px;font-weight:300}
.body{padding:32px}.ftr{background:#f9f9f9;padding:16px 32px;text-align:center;font-size:11px;color:#9CA3AF;border-top:1px solid #e5e7eb}
h2{color:#0A0A0A;font-size:17px;font-weight:600;margin:0 0 12px}
p{color:#6B6B6B;font-size:13px;line-height:1.7;margin:0 0 8px}
.id-box{background:#F5F0EB;border-left:4px solid #0A0A0A;padding:16px 20px;margin:16px 0}
.id{font-family:monospace;font-size:20px;font-weight:700;color:#0A0A0A}
.badge{display:inline-block;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;padding:3px 10px;border-radius:3px}
.btn{display:inline-block;background:#0A0A0A;color:#fff;padding:12px 28px;text-decoration:none;font-size:12px;letter-spacing:0.15em;text-transform:uppercase}
</style></head><body>
<div class="wrap">
<div class="hdr"><span class="logo">AMRIN</span></div>
<div class="body">
<h2>We received your ${ret.type === 'return' ? 'refund' : 'exchange'} request</h2>
<p>Your request has been submitted successfully. Our team will review it within 24-48 hours.</p>
<div class="id-box">
  <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#6B6B6B;margin:0 0 4px;">Request ID</p>
  <span class="id">${ret.returnId}</span>
  <span class="badge" style="margin-left:12px;background:${ret.type==='return'?'#fef2f2':'#eff6ff'};color:${ret.type==='return'?'#b91c1c':'#1d4ed8'};border:1px solid ${ret.type==='return'?'#fecaca':'#bfdbfe'}">${typeLabel}</span>
</div>
<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0;border:1px solid #e5e7eb">
<thead><tr style="background:#F5F0EB;">
  <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;">Item</th>
  <th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;">Size</th>
  <th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;">Qty</th>
  <th style="padding:8px 12px;text-align:right;font-size:11px;text-transform:uppercase;">Price</th>
  ${ret.type === 'exchange' ? '<th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;">New Size</th>' : ''}
</tr></thead>
<tbody>${itemsRows}</tbody>
</table>
${ret.type === 'return' ? `<p style="font-weight:600;color:#0A0A0A;">Estimated Refund: ₹${ret.refundAmount.toLocaleString('en-IN')}</p><p style="font-size:11px;font-style:italic;">Final amount confirmed after item inspection.</p>` : ''}
<p style="margin-top:16px;">You will receive an email update on every status change.</p>
<div style="text-align:center;margin:24px 0;">
<a href="${clientUrl}/my-returns" class="btn">Track Your Request</a>
</div>
</div>
<div class="ftr">&copy; ${year} ${brand}</div>
</div></body></html>`

  await getTransporter().sendMail({ from, to: ret.customerEmail, subject: `Return Request Received — ${ret.returnId}`, html })
}

/* ── Return status update email ──────────────────────────────────────────────── */
async function sendReturnStatusEmail(ret) {
  const brand     = process.env.FROM_NAME  || 'AMRIN Fashion'
  const from      = `"${brand}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`
  const year      = new Date().getFullYear()
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

  const messages = {
    approved:            'Your request has been approved! Our team will schedule a pickup soon.',
    rejected:            `Unfortunately your request was not approved.${ret.adminNote ? `<br/><strong>Reason:</strong> ${ret.adminNote}` : ''}`,
    pickup_scheduled:    `Pickup scheduled for <strong>${ret.pickupDate ? new Date(ret.pickupDate).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}) : 'soon'}</strong>. Please keep the item ready and packed.`,
    item_received:       'We have received your item. Our team is inspecting it now.',
    refund_approved:     `Your refund of <strong>₹${ret.refundAmount?.toLocaleString('en-IN')}</strong> has been approved!`,
    refund_rejected:     `Your refund request was not approved.${ret.adminNote ? `<br/><strong>Reason:</strong> ${ret.adminNote}` : ''}`,
    refund_processed:    `Your refund of <strong>₹${ret.refundAmount?.toLocaleString('en-IN')}</strong> has been processed. Reference: <strong>${ret.refundReference || 'N/A'}</strong>`,
    exchange_dispatched: `Your exchange item has been shipped! Tracking: <strong>${ret.exchangeTrackingNumber || 'N/A'}</strong>`,
    exchange_delivered:  'Your exchange item has been delivered. Enjoy your new size!',
    cancelled:           'This request has been cancelled.',
  }

  const msg = messages[ret.status] || `Your request status has been updated to <strong>${ret.status}</strong>.`

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>body{margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif}
.wrap{max-width:480px;margin:32px auto;background:#fff;border:1px solid #e5e7eb}
.hdr{background:#0A0A0A;padding:28px;text-align:center}
.logo{color:#fff;font-size:22px;letter-spacing:8px;font-weight:300}
.body{padding:32px}.ftr{background:#f9f9f9;padding:16px 32px;text-align:center;font-size:11px;color:#9CA3AF;border-top:1px solid #e5e7eb}
h2{color:#0A0A0A;font-size:17px;font-weight:600;margin:0 0 12px}
p{color:#6B6B6B;font-size:13px;line-height:1.7;margin:0 0 8px}
.id{font-family:monospace;font-size:14px;font-weight:600;color:#0A0A0A;background:#F5F0EB;padding:4px 10px}
.btn{display:inline-block;background:#0A0A0A;color:#fff;padding:12px 28px;text-decoration:none;font-size:12px;letter-spacing:0.15em;text-transform:uppercase}
</style></head><body>
<div class="wrap">
<div class="hdr"><span class="logo">AMRIN</span></div>
<div class="body">
<h2>Update on your request</h2>
<p>Request ID: <span class="id">${ret.returnId}</span></p>
<p style="margin:16px 0;color:#0A0A0A;">${msg}</p>
<div style="text-align:center;margin:24px 0;">
<a href="${clientUrl}/my-returns" class="btn">View Request</a>
</div>
</div>
<div class="ftr">&copy; ${year} ${brand}</div>
</div></body></html>`

  await getTransporter().sendMail({ from, to: ret.customerEmail, subject: `Update on ${ret.returnId} — ${ret.status.replace(/_/g,' ')}`, html })
}

module.exports = { sendOTPEmail, sendLoginOTPEmail, sendReturnConfirmationEmail, sendReturnStatusEmail }
