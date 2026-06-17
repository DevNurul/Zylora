const PDFDocument = require('pdfkit')

const BLACK = '#000000'
const DARK = '#1A1A1A'
const GRAY = '#666666'
const LIGHT_GRAY = '#999999'
const BORDER = '#333333'

function drawRect(doc, x, y, w, h, opts = {}) {
  doc.save()
  if (opts.fill) doc.rect(x, y, w, h).fill(opts.fill)
  if (opts.stroke) {
    doc.rect(x, y, w, h).lineWidth(opts.lineWidth || 1).strokeColor(opts.stroke).stroke()
  }
  doc.restore()
}

function generateAddressLabel(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [432, 288], // 6 inches x 4 inches at 72dpi
      margin: 20,
    })
    const chunks = []

    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const pageW = 432
    const pageH = 288
    const m = 20

    // Outer border
    drawRect(doc, 2, 2, pageW - 4, pageH - 4, { stroke: BORDER, lineWidth: 2 })

    // ── HEADER BAR ──
    drawRect(doc, 2, 2, pageW - 4, 32, { fill: BLACK })
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#FFFFFF')
      .text('ZYLARA', m, 10, { width: pageW - m * 2, align: 'left' })
    doc.font('Helvetica').fontSize(7).fillColor(LIGHT_GRAY)
      .text('S H I P P I N G   L A B E L', m, 23, { width: pageW - m * 2, align: 'left' })

    let y = 50

    // ── FROM / TO ──
    const halfW = (pageW - m * 2 - 20) / 2

    // FROM
    doc.font('Helvetica-Bold').fontSize(7).fillColor(DARK)
      .text('FROM', m, y)
    doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK)
      .text('ZYLARA', m, y + 12)
    doc.font('Helvetica').fontSize(8).fillColor(GRAY)
    doc.text('Bengaluru, Karnataka 560107', m, y + 25)

    // TO
    const toX = m + halfW + 20

    drawRect(doc, toX - 5, y - 3, halfW + 10, 80, { fill: '#F0F0F0', stroke: BORDER, lineWidth: 0.5 })

    doc.font('Helvetica-Bold').fontSize(7).fillColor(DARK)
      .text('SHIP TO', toX, y)
    y += 14

    const addr = order.shippingAddress || {}
    doc.font('Helvetica-Bold').fontSize(10).fillColor(DARK)
      .text(order.customerName, toX, y, { width: halfW - 10 })
    y += 16

    doc.font('Helvetica').fontSize(8).fillColor(DARK)
    doc.text(order.phone, toX, y, { width: halfW - 10 })
    y += 12

    const addrLines = [
      addr.addressLine1,
      addr.addressLine2,
      [addr.city, addr.state].filter(Boolean).join(', '),
      addr.pincode,
    ].filter(Boolean)

    doc.fillColor(GRAY)
    for (const line of addrLines) {
      doc.text(line, toX, y, { width: halfW - 10 })
      y += 11
    }

    // ── ORDER ID ──
    const bottomY = pageH - 50
    doc.save().moveTo(m, bottomY).lineTo(pageW - m, bottomY).lineWidth(0.5).strokeColor(BORDER).stroke().restore()

    doc.font('Helvetica-Bold').fontSize(7).fillColor(DARK)
      .text('ORDER', m, bottomY + 8)
    doc.font('Helvetica').fontSize(8).fillColor(DARK)
      .text(order.orderId, m + 35, bottomY + 8)

    // ── FOOTER ──
    doc.save().moveTo(m, pageH - 28).lineTo(pageW - m, pageH - 28).lineWidth(0.5).strokeColor(BORDER).stroke().restore()
    doc.font('Helvetica').fontSize(6).fillColor(LIGHT_GRAY)
      .text('ZYLARA  |  care@zylara.co.in  |  +91 86378 74951', m, pageH - 22, {
        width: pageW - m * 2, align: 'center',
      })

    doc.end()
  })
}

module.exports = generateAddressLabel
