const PDFDocument = require('pdfkit')

const BLACK = '#000000'
const DARK = '#1A1A1A'
const GRAY = '#666666'
const LIGHT_GRAY = '#999999'
const BORDER = '#CCCCCC'
const BG_LIGHT = '#F0F0F0'

function drawLine(doc, y, x1, x2, color = BORDER, width = 0.5) {
  doc.save().moveTo(x1, y).lineTo(x2, y).lineWidth(width).strokeColor(color).stroke().restore()
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatPrice(amount) {
  return 'Rs. ' + Number(amount).toLocaleString('en-IN')
}

function generateInvoice(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 })
    const chunks = []

    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const pageW = doc.page.width
    const margin = 40
    const contentW = pageW - margin * 2
    let y = margin

    // ── HEADER ──
    doc.font('Helvetica-Bold').fontSize(18).fillColor(BLACK)
      .text('ZYLARA', margin, y, { width: contentW, align: 'left' })
    doc.font('Helvetica').fontSize(6).fillColor(LIGHT_GRAY)
      .text('J E W E L L E R Y', margin, y + 21)
    doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK)
      .text('INVOICE', margin, y, { width: contentW, align: 'right' })
    y += 35

    drawLine(doc, y, margin, pageW - margin, BLACK, 1)
    y += 10

    // ── INVOICE DETAILS ──
    doc.font('Helvetica').fontSize(8).fillColor(GRAY)
    doc.text(`Invoice: INV-${order.orderId}`, margin, y)
    doc.text(`Date: ${formatDate(order.createdAt)}`, margin + 180, y)
    doc.text(`Payment: ${order.paymentMethod === 'ONLINE' ? 'Online' : 'COD'}`, margin + 320, y)
    y += 12
    doc.text(`Status: ${order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'failed' ? 'Failed' : 'Pending'}`, margin, y)
    y += 15

    drawLine(doc, y, margin, pageW - margin, BORDER)
    y += 10

    // ── BILL TO / SHIP TO ──
    const halfW = contentW / 2 - 10

    doc.font('Helvetica-Bold').fontSize(7).fillColor(DARK)
      .text('BILL TO', margin, y)
    doc.font('Helvetica-Bold').fontSize(7).fillColor(DARK)
      .text('SHIP TO', margin + halfW + 20, y)
    y += 12

    doc.font('Helvetica').fontSize(8).fillColor(DARK)
    doc.text(order.customerName, margin, y, { width: halfW })
    doc.text(order.email, margin, y + 11, { width: halfW })
    doc.text(order.phone, margin, y + 22, { width: halfW })

    const addr = order.shippingAddress || {}
    const addrLines = [
      addr.addressLine1,
      addr.addressLine2,
      [addr.city, addr.state].filter(Boolean).join(', '),
      addr.pincode,
    ].filter(Boolean)

    doc.text(order.customerName, margin + halfW + 20, y, { width: halfW })
    addrLines.forEach((line, i) => {
      doc.text(line, margin + halfW + 20, y + 11 + i * 11, { width: halfW })
    })
    y += 11 + Math.max(addrLines.length, 3) * 11 + 8

    drawLine(doc, y, margin, pageW - margin, BORDER)
    y += 10

    // ── ITEMS TABLE ──
    const col = {
      sku: margin,
      item: margin + 85,
      size: margin + 240,
      color: margin + 280,
      qty: margin + 345,
      price: margin + 380,
      total: margin + 440,
    }

    doc.rect(margin, y, contentW, 18).fill(BG_LIGHT)
    doc.font('Helvetica-Bold').fontSize(6).fillColor(GRAY)
    doc.text('SKU', col.sku + 4, y + 6)
    doc.text('ITEM', col.item, y + 6)
    doc.text('SIZE', col.size, y + 6)
    doc.text('COLOR', col.color, y + 6)
    doc.text('QTY', col.qty, y + 6, { width: 25, align: 'center' })
    doc.text('PRICE', col.price, y + 6, { width: 50, align: 'right' })
    doc.text('TOTAL', col.total, y + 6, { width: 55, align: 'right' })
    y += 24

    doc.font('Helvetica').fontSize(7).fillColor(DARK)
    for (const item of order.items) {
      doc.text(item.sku || '—', col.sku + 4, y, { width: 75, ellipsis: true })
      doc.text(item.name || '—', col.item, y, { width: 150, ellipsis: true })
      doc.text(item.size || '—', col.size, y, { width: 35 })
      doc.text(item.color || '—', col.color, y, { width: 60, ellipsis: true })
      doc.text(String(item.qty), col.qty, y, { width: 25, align: 'center' })
      doc.text(formatPrice(item.price), col.price, y, { width: 50, align: 'right' })
      doc.text(formatPrice(item.price * item.qty), col.total, y, { width: 55, align: 'right' })
      y += 13
      drawLine(doc, y - 3, margin, pageW - margin, '#DDDDDD', 0.3)
    }
    y += 6

    drawLine(doc, y, margin, pageW - margin, BORDER)
    y += 10

    // ── TOTALS ──
    const totalsX = margin + 310
    const totalsValX = margin + 440

    doc.font('Helvetica').fontSize(8).fillColor(GRAY)
    doc.text('Subtotal', totalsX, y, { width: 100, align: 'left' })
    doc.text(formatPrice(order.subtotal), totalsValX, y, { width: 55, align: 'right' })
    y += 14

    if (order.discount > 0) {
      doc.text(`Discount ${order.couponCode ? '(' + order.couponCode + ')' : ''}`, totalsX, y, { width: 100, align: 'left' })
      doc.text(`-${formatPrice(order.discount)}`, totalsValX, y, { width: 55, align: 'right' })
      y += 14
    }

    doc.text('Shipping', totalsX, y, { width: 100, align: 'left' })
    doc.text(order.shippingCharge === 0 ? 'FREE' : formatPrice(order.shippingCharge), totalsValX, y, {
      width: 55, align: 'right',
    })
    y += 14

    doc.text('GST', totalsX, y, { width: 100, align: 'left' })
    doc.text('0%', totalsValX, y, { width: 55, align: 'right' })
    y += 10

    drawLine(doc, y, totalsX, totalsValX + 55, BLACK, 1)
    y += 8

    doc.font('Helvetica-Bold').fontSize(10).fillColor(DARK)
    doc.text('TOTAL', totalsX, y, { width: 100, align: 'left' })
    doc.text(formatPrice(order.total), totalsValX, y, { width: 55, align: 'right' })
    y += 18

    // ── GST NOTE ──
    doc.font('Helvetica').fontSize(7).fillColor(LIGHT_GRAY)
      .text('* Seller is not registered for GST. GST is not applicable on this invoice.', margin, y, { width: contentW, align: 'left' })
    y += 15

    drawLine(doc, y, margin, pageW - margin, BLACK, 1)
    y += 12

    // ── FOOTER ──
    doc.font('Helvetica').fontSize(7).fillColor(LIGHT_GRAY)
      .text('Thank you for shopping with ZYLARA', margin, y, { width: contentW, align: 'center' })
    y += 12
    doc.text('care@zylara.co.in  |  +91 86378 74951  |  www.zylara.com', margin, y, { width: contentW, align: 'center' })

    doc.end()
  })
}

module.exports = generateInvoice
