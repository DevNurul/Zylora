const { customAlphabet } = require('nanoid')

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const generateId = customAlphabet(alphabet, 6)

const generateOrderId = () => `ORD-${generateId()}`

module.exports = generateOrderId
