const PDFDocument = require('pdfkit')

const BLACK = '#000000'
const DARK = '#1A1A1A'
const GRAY = '#666666'
const LIGHT_GRAY = '#999999'
const BORDER = '#CCCCCC'
const BG_LIGHT = '#F0F0F0'
const BORDER_DARK = '#333333'

function drawLine(doc, y, x1, x2, color = BORDER, width = 0.5) {
  doc.save().moveTo(x1, y).lineTo(x2, y).lineWidth(width).strokeColor(color).stroke().restore()
}

function drawRect(doc, x, y, w, h, opts = {}) {
  doc.save()
  if (opts.fill) doc.rect(x, y, w, h).fill(opts.fill)
  if (opts.stroke) {
    doc.rect(x, y, w, h).lineWidth(opts.lineWidth || 1).strokeColor(opts.stroke).stroke()
  }
  doc.restore()
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatPrice(amount) {
  return 'Rs. ' + Number(amount).toLocaleString('en-IN')
}

function generateCombinedPdf(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 35 })
    const chunks = []

    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const pageW = doc.page.width
    const margin = 35
    const contentW = pageW - margin * 2
    let y = margin

    // ══════════════════════════════════════════════
    // TOP SECTION — INVOICE
    // ══════════════════════════════════════════════

    // ── HEADER ──
    doc.font('Helvetica-Bold').fontSize(16).fillColor(BLACK)
      .text('ZYLARA', margin, y, { width: contentW, align: 'left' })
    doc.font('Helvetica').fontSize(5).fillColor(LIGHT_GRAY)
      .text('J E W E L L E R Y', margin, y + 18)
    doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK)
      .text('INVOICE', margin, y, { width: contentW, align: 'right' })
    y += 30

    drawLine(doc, y, margin, pageW - margin, BLACK, 1)
    y += 8

    // ── INVOICE DETAILS ──
    doc.font('Helvetica').fontSize(7).fillColor(GRAY)
    doc.text(`Invoice: INV-${order.orderId}`, margin, y)
    doc.text(`Date: ${formatDate(order.createdAt)}`, margin + 170, y)
    doc.text(`Payment: ${order.paymentMethod === 'ONLINE' ? 'Online' : 'COD'}`, margin + 310, y)
    y += 12

    drawLine(doc, y, margin, pageW - margin, BORDER)
    y += 8

    // ── BILL TO / SHIP TO ──
    const halfW = contentW / 2 - 10

    doc.font('Helvetica-Bold').fontSize(6).fillColor(DARK)
      .text('BILL TO', margin, y)
    doc.font('Helvetica-Bold').fontSize(6).fillColor(DARK)
      .text('SHIP TO', margin + halfW + 20, y)
    y += 10

    doc.font('Helvetica').fontSize(7).fillColor(DARK)
    doc.text(order.customerName, margin, y, { width: halfW })
    doc.text(order.email, margin, y + 10, { width: halfW })
    doc.text(order.phone, margin, y + 20, { width: halfW })

    const addr = order.shippingAddress || {}
    const addrLines = [
      addr.addressLine1,
      addr.addressLine2,
      [addr.city, addr.state].filter(Boolean).join(', '),
      addr.pincode,
    ].filter(Boolean)

    doc.text(order.customerName, margin + halfW + 20, y, { width: halfW })
    addrLines.forEach((line, i) => {
      doc.text(line, margin + halfW + 20, y + 10 + i * 10, { width: halfW })
    })
    y += 10 + Math.max(addrLines.length, 3) * 10 + 6

    drawLine(doc, y, margin, pageW - margin, BORDER)
    y += 8

    // ── ITEMS TABLE ──
    const col = {
      sku: margin,
      item: margin + 80,
      size: margin + 220,
      color: margin + 260,
      qty: margin + 330,
      price: margin + 365,
      total: margin + 425,
    }

    doc.rect(margin, y, contentW, 16).fill(BG_LIGHT)
    doc.font('Helvetica-Bold').fontSize(5.5).fillColor(GRAY)
    doc.text('SKU', col.sku + 4, y + 5)
    doc.text('ITEM', col.item, y + 5)
    doc.text('SIZE', col.size, y + 5)
    doc.text('COLOR', col.color, y + 5)
    doc.text('QTY', col.qty, y + 5, { width: 25, align: 'center' })
    doc.text('PRICE', col.price, y + 5, { width: 45, align: 'right' })
    doc.text('TOTAL', col.total, y + 5, { width: 50, align: 'right' })
    y += 20

    doc.font('Helvetica').fontSize(6.5).fillColor(DARK)
    for (const item of order.items) {
      doc.text(item.sku || '—', col.sku + 4, y, { width: 70, ellipsis: true })
      doc.text(item.name || '—', col.item, y, { width: 135, ellipsis: true })
      doc.text(item.size || '—', col.size, y, { width: 35 })
      doc.text(item.color || '—', col.color, y, { width: 65, ellipsis: true })
      doc.text(String(item.qty), col.qty, y, { width: 25, align: 'center' })
      doc.text(formatPrice(item.price), col.price, y, { width: 45, align: 'right' })
      doc.text(formatPrice(item.price * item.qty), col.total, y, { width: 50, align: 'right' })
      y += 12
      drawLine(doc, y - 3, margin, pageW - margin, '#DDDDDD', 0.3)
    }
    y += 4

    drawLine(doc, y, margin, pageW - margin, BORDER)
    y += 8

    // ── TOTALS ──
    const totalsX = margin + 300
    const totalsValX = margin + 425

    doc.font('Helvetica').fontSize(7).fillColor(GRAY)
    doc.text('Subtotal', totalsX, y, { width: 100, align: 'left' })
    doc.text(formatPrice(order.subtotal), totalsValX, y, { width: 50, align: 'right' })
    y += 12

    if (order.discount > 0) {
      doc.text(`Discount ${order.couponCode ? '(' + order.couponCode + ')' : ''}`, totalsX, y, { width: 100, align: 'left' })
      doc.text(`-${formatPrice(order.discount)}`, totalsValX, y, { width: 50, align: 'right' })
      y += 12
    }

    doc.text('Shipping', totalsX, y, { width: 100, align: 'left' })
    doc.text(order.shippingCharge === 0 ? 'FREE' : formatPrice(order.shippingCharge), totalsValX, y, {
      width: 50, align: 'right',
    })
    y += 12

    doc.text('GST', totalsX, y, { width: 100, align: 'left' })
    doc.text('0%', totalsValX, y, { width: 50, align: 'right' })
    y += 8

    drawLine(doc, y, totalsX, totalsValX + 50, BLACK, 1)
    y += 6

    doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK)
    doc.text('TOTAL', totalsX, y, { width: 100, align: 'left' })
    doc.text(formatPrice(order.total), totalsValX, y, { width: 50, align: 'right' })
    y += 14

    doc.font('Helvetica').fontSize(6).fillColor(LIGHT_GRAY)
      .text('* Seller is not registered for GST. GST is not applicable on this invoice.', margin, y, { width: contentW, align: 'left' })
    y += 12

    // ══════════════════════════════════════════════
    // DIVIDER — dashed line separating invoice from label
    // ══════════════════════════════════════════════
    doc.save()
      .moveTo(margin, y)
      .lineTo(pageW - margin, y)
      .lineWidth(1)
      .dash(5, { space: 3 })
      .strokeColor(BLACK)
      .stroke()
      .restore()
    y += 10

    // ══════════════════════════════════════════════
    // BOTTOM SECTION — SHIPPING LABEL (compact)
    // ══════════════════════════════════════════════

    // Label header bar
    drawRect(doc, margin, y, contentW, 18, { fill: BLACK })
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF')
      .text('SHIPPING LABEL', margin + 8, y + 5, { width: contentW, align: 'left' })
    y += 24

    // FROM / TO side by side
    const labelHalfW = (contentW - 20) / 2

    // FROM box
    drawRect(doc, margin - 2, y - 2, labelHalfW + 4, 65, { stroke: BORDER_DARK, lineWidth: 0.5 })

    doc.font('Helvetica-Bold').fontSize(6).fillColor(DARK)
      .text('FROM', margin + 4, y)
    doc.font('Helvetica-Bold').fontSize(8).fillColor(DARK)
      .text('ZYLARA', margin + 4, y + 10)
    doc.font('Helvetica').fontSize(7).fillColor(GRAY)
    doc.text('Bengaluru, Karnataka 560107', margin + 4, y + 22)
    doc.text('India', margin + 4, y + 32)

    // TO box
    const toX = margin + labelHalfW + 20
    drawRect(doc, toX - 5, y - 2, labelHalfW + 4, 65, { fill: BG_LIGHT, stroke: BORDER_DARK, lineWidth: 0.5 })

    doc.font('Helvetica-Bold').fontSize(6).fillColor(DARK)
      .text('SHIP TO', toX + 2, y)

    doc.font('Helvetica-Bold').fontSize(8).fillColor(DARK)
      .text(order.customerName, toX + 2, y + 10, { width: labelHalfW - 12 })

    doc.font('Helvetica').fontSize(7).fillColor(DARK)
    doc.text(order.phone, toX + 2, y + 22, { width: labelHalfW - 12 })

    doc.fillColor(GRAY)
    const shipAddr = [
      addr.addressLine1,
      addr.addressLine2,
      [addr.city, addr.state].filter(Boolean).join(', '),
      addr.pincode,
    ].filter(Boolean)
    doc.text(shipAddr.join(', '), toX + 2, y + 34, { width: labelHalfW - 12 })

    y += 72

    // ── ORDER + PAYMENT ──
    drawLine(doc, y, margin, pageW - margin, BORDER_DARK, 0.5)
    y += 6

    doc.font('Helvetica-Bold').fontSize(7).fillColor(DARK)
      .text('ORDER', margin, y)
    doc.font('Helvetica').fontSize(8).fillColor(DARK)
      .text(order.orderId, margin + 35, y)

    doc.font('Helvetica-Bold').fontSize(7).fillColor(DARK)
      .text('PAYMENT', margin + 200, y)
    doc.font('Helvetica').fontSize(8).fillColor(DARK)
      .text(order.paymentMethod === 'ONLINE' ? 'Online' : 'Cash on Delivery', margin + 248, y)

    y += 14

    // ── FOOTER ──
    drawLine(doc, y, margin, pageW - margin, BLACK, 0.5)
    y += 6
    doc.font('Helvetica').fontSize(6).fillColor(LIGHT_GRAY)
      .text('Thank you for shopping with ZYLARA  |  care@zylara.co.in  |  +91 86378 74951', margin, y, { width: contentW, align: 'center' })

    doc.end()
  })
}

module.exports = generateCombinedPdf
