const transporter = require('../config/email')

const brandName = process.env.FROM_NAME || 'Zylara'
const brandEmail = process.env.FROM_EMAIL || process.env.SMTP_USER || 'official@zylara.co.in'

const baseStyle = `
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #0A0A0A;
  max-width: 600px;
  margin: 0 auto;
`

const headerHtml = `
  <div style="background:#0A0A0A;padding:24px 32px;">
    <h1 style="color:#fff;font-size:24px;letter-spacing:0.3em;font-weight:300;margin:0;text-transform:uppercase;">${brandName}</h1>
    <p style="color:#C9A96E;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin:4px 0 0;">Premium Sterling Silver Jewelry</p>
  </div>
`

const footerHtml = `
  <div style="border-top:1px solid #e5e7eb;padding:24px 32px;text-align:center;color:#6B6B6B;font-size:12px;">
    <p style="margin:0 0 4px;">${brandName} · Premium Sterling Silver Jewelry</p>
    <p style="margin:0;">${brandEmail}</p>
  </div>
`

const itemsTable = (items) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0;">
    <thead>
      <tr style="background:#F5F0EB;">
        <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Item</th>
        <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Qty</th>
        <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Price</th>
      </tr>
    </thead>
    <tbody>
      ${items.map((item) => `
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:12px;">
            <div style="font-size:14px;font-weight:500;">${item.name}</div>
            <div style="font-size:12px;color:#6B6B6B;margin-top:2px;">${item.size} · ${item.color}</div>
          </td>
          <td style="padding:12px;text-align:center;font-size:14px;">${item.qty}</td>
          <td style="padding:12px;text-align:right;font-size:14px;font-weight:600;">
            ₹${(item.price * item.qty).toLocaleString('en-IN')}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>
`

const trackButton = (orderId) => `
  <div style="text-align:center;margin:24px 0;">
    <a href="${process.env.CLIENT_URL}/track-order?orderId=${orderId}"
      style="display:inline-block;background:#0A0A0A;color:#fff;padding:14px 32px;
        text-decoration:none;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;">
      Track Your Order
    </a>
  </div>
`

const sendOrderConfirmationEmail = async (order) => {
  const addr = order.shippingAddress
  const html = `
    <div style="${baseStyle}">
      ${headerHtml}
      <div style="padding:32px;">
        <h2 style="font-size:20px;font-weight:400;margin:0 0 8px;">Order Confirmed!</h2>
        <p style="color:#6B6B6B;margin:0 0 24px;">
          Thank you for your order, <strong>${order.customerName}</strong>!
          Your order has been received and is being processed.
        </p>

        <div style="background:#F5F0EB;padding:16px 20px;margin:0 0 24px;">
          <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6B6B6B;margin:0 0 4px;">Order ID</p>
          <p style="font-size:22px;font-family:monospace;font-weight:700;letter-spacing:0.1em;margin:0;color:#0A0A0A;">
            ${order.orderId}
          </p>
        </div>

        <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px;">Items Ordered</h3>
        ${itemsTable(order.items)}

        <div style="border-top:2px solid #0A0A0A;padding-top:16px;margin-top:8px;">
          ${order.discount > 0 ? `
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="color:#6B6B6B;">Subtotal</span>
              <span>₹${order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;color:green;">
              <span>Discount (${order.couponCode})</span>
              <span>-₹${order.discount.toLocaleString('en-IN')}</span>
            </div>
          ` : ''}
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="color:#6B6B6B;">Shipping</span>
            <span>${order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;margin-top:12px;border-top:1px solid #e5e7eb;padding-top:12px;">
            <span>Total</span>
            <span>₹${order.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.1em;margin:24px 0 8px;">Shipping To</h3>
        <p style="color:#6B6B6B;line-height:1.6;margin:0;">
          ${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}<br/>
          ${addr.city}, ${addr.state} - ${addr.pincode}
        </p>

        ${trackButton(order.orderId)}

        <p style="font-size:12px;color:#6B6B6B;text-align:center;">
          Payment: <strong>${order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</strong>
        </p>
      </div>
      ${footerHtml}
    </div>
  `

  await transporter.sendMail({
    from: `"${brandName}" <${process.env.FROM_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER}>`,
    to: order.email,
    subject: `Order Confirmed - ${order.orderId}`,
    html,
  })
}

const STATUS_MESSAGES = {
  confirmed: 'Your order has been confirmed and is being prepared for shipment.',
  shipped: (tracking) =>
    `Your order is on its way! Tracking number: <strong>${tracking || 'N/A'}</strong>`,
  out_for_delivery: 'Your order is out for delivery and will arrive today.',
  delivered: 'Your order has been delivered. We hope you love your purchase!',
  cancelled: 'Your order has been cancelled. If you have questions, please contact us.',
}

const sendOrderStatusEmail = async (order) => {
  const msg = typeof STATUS_MESSAGES[order.status] === 'function'
    ? STATUS_MESSAGES[order.status](order.trackingNumber)
    : STATUS_MESSAGES[order.status] || `Your order status has been updated to ${order.status}.`

  const statusColor = {
    confirmed: '#C9A96E',
    shipped: '#3B82F6',
    out_for_delivery: '#8B5CF6',
    delivered: '#22C55E',
    cancelled: '#EF4444',
  }[order.status] || '#0A0A0A'

  const html = `
    <div style="${baseStyle}">
      ${headerHtml}
      <div style="padding:32px;">
        <h2 style="font-size:20px;font-weight:400;margin:0 0 8px;">Order Update</h2>
        <p style="color:#6B6B6B;margin:0 0 24px;">Hi ${order.customerName},</p>

        <div style="background:${statusColor}18;border-left:4px solid ${statusColor};padding:16px 20px;margin:0 0 24px;">
          <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6B6B6B;margin:0 0 6px;">Status</p>
          <p style="font-size:18px;font-weight:700;color:${statusColor};margin:0;">
            ${order.status.replace(/_/g, ' ').toUpperCase()}
          </p>
        </div>

        <p style="line-height:1.7;margin:0 0 24px;"
           dangerouslySetInnerHTML={undefined}>${msg}</p>

        <div style="background:#F5F0EB;padding:12px 20px;margin:0 0 24px;display:inline-block;">
          <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6B6B6B;margin:0 0 2px;">Order ID</p>
          <p style="font-family:monospace;font-weight:700;margin:0;">${order.orderId}</p>
        </div>

        ${trackButton(order.orderId)}
      </div>
      ${footerHtml}
    </div>
  `

  await transporter.sendMail({
    from: `"${brandName}" <${process.env.FROM_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER}>`,
    to: order.email,
    subject: `Order Update - ${order.orderId} is ${order.status.replace(/_/g, ' ')}`,
    html,
  })
}

module.exports = { sendOrderConfirmationEmail, sendOrderStatusEmail }
