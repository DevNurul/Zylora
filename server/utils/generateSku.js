const { customAlphabet } = require('nanoid')

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const random2 = customAlphabet(alphabet, 2)

function abbreviate(str, len = 4) {
  return str
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, len)
    .padEnd(len, 'X')
}

function generateSku(categoryName, color, size) {
  const cat = abbreviate(categoryName || 'ITEM', 4)
  const col = abbreviate(color || 'NO', 2)
  const sz = (size || 'OS').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3)
  return `ZYL-${cat}-${col}-${sz}-${random2()}`
}

function generateVariantSkuMap(categoryName, colors = [], sizes = []) {
  const map = {}
  const colorList = colors.length > 0 ? colors : ['']
  const sizeList = sizes.length > 0 ? sizes : ['']

  for (const color of colorList) {
    for (const size of sizeList) {
      const key = `${color || 'default'}:${size || 'default'}`
      map[key] = generateSku(categoryName, color, size)
    }
  }
  return map
}

module.exports = { generateSku, generateVariantSkuMap }
