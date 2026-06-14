/**
 * AMRIN e-commerce backend — full API test suite
 * --------------------------------------------------
 * Node.js + axios. Runs every endpoint in the spec order, prints a
 * PASS/FAIL line per test and a final summary, then cleans up test data.
 *
 * Usage:
 *   node api-test.js                       # defaults to http://localhost:5000
 *   API_BASE_URL=https://api.amrin.co.in node api-test.js
 *
 * Notes on deviations from the original spec (see README at bottom of output):
 *   - Admin auth is JWT Bearer + role:'admin' (NOT an x-admin-key header).
 *   - Public product category filter expects a category _id (ObjectId),
 *     not the slug "women".
 *   - Cleanup uses mongoose directly (no cleanup endpoint exists) and also
 *     restores the stock decremented by the test order.
 */

require('dotenv').config()
const axios    = require('axios')
const mongoose = require('mongoose')

const User    = require('./models/User')
const Order   = require('./models/Order')
const Product = require('./models/Product')
const Coupon  = require('./models/Coupon')

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000'

// ── Test fixtures ──────────────────────────────────────────────────────────────
const TEST = {
  name:     'Test User',
  email:    'autotest@amrin.in',
  phone:    '9999999999',
  password: 'Test@1234',
}
const ADMIN = {
  name:     'Auto Test Admin',
  email:    'autotest-admin@amrin.in',
  phone:    '9999999999',
  password: 'AdminTest@1234',
}

const http = axios.create({ baseURL: BASE_URL, timeout: 20000, validateStatus: () => true })
const bearer = (t, extra = {}) => ({ headers: { ...(t ? { Authorization: `Bearer ${t}` } : {}), ...extra } })

// A product is orderable if it has stock. It may track stock per-size (sizeStock map)
// or as a single total (stock). Returns the size to order, or null if unavailable.
function sizeStockOf(p) {
  return (p.sizeStock && typeof p.sizeStock === 'object' && Object.keys(p.sizeStock).length) ? p.sizeStock : null
}
function orderableSize(p) {
  const ss = sizeStockOf(p)
  if (ss) {
    const inStock = Object.entries(ss).find(([, q]) => Number(q) > 0)
    return inStock ? inStock[0] : null
  }
  return (p.stock || 0) > 0 ? ((p.sizes && p.sizes.includes('M')) ? 'M' : (p.sizes?.[0] || 'M')) : null
}

// ── Result tracking / pretty printing ──────────────────────────────────────────
const results = []
function print(ok, i, method, path, lines) {
  console.log(`${ok ? '\x1b[32m✓ PASS\x1b[0m' : '\x1b[31m✗ FAIL\x1b[0m'}  [${i}/37] ${method} ${path}`)
  for (const l of lines) console.log(`         → ${l}`)
}
function pass(i, method, path, msg)   { results.push({ i, method, path, ok: true });  print(true,  i, method, path, [msg]) }
function fail(i, method, path, lines) { results.push({ i, method, path, ok: false }); print(false, i, method, path, Array.isArray(lines) ? lines : [lines]) }

// Shared state across tests
const state = { token: null, adminToken: null, productId: null, product: null, orderId: null, addressId: null, orderedQty: 1, orderCreated: false, createdCoupon: false, bump: null }

async function setup() {
  await mongoose.connect(process.env.MONGODB_URI)
  // Clean slate so register/login are deterministic
  await User.deleteMany({ email: { $in: [TEST.email, ADMIN.email] } })
  await Order.deleteMany({ email: TEST.email })
  // Pre-create the admin account (role:admin) so the admin section has a real JWT to use
  await User.create({ ...ADMIN, role: 'admin' })
  // The coupon-validation test (#14) needs an active FIRST10 coupon. Seed data may
  // be absent on this DB, so provision it here and remove it in cleanup if we made it.
  if (!(await Coupon.findOne({ code: 'FIRST10' }))) {
    await Coupon.create({ code: 'FIRST10', discountType: 'percentage', discountValue: 10, minOrderValue: 500, isActive: true })
    state.createdCoupon = true
  }
}

async function cleanup() {
  // Restore the chosen product's stock to its exact pre-test value (undoes both the
  // order decrement and any temporary bump we applied to make it orderable).
  if (state.bump) {
    await Product.updateOne({ _id: state.bump.id }, { $set: state.bump.set }).catch(() => {})
  }
  if (state.createdCoupon) await Coupon.deleteOne({ code: 'FIRST10' }).catch(() => {})
  const delUser  = await User.deleteOne({ email: TEST.email })
  await User.deleteOne({ email: ADMIN.email })
  const delOrder = await Order.deleteMany({ email: TEST.email })
  const gone = (await User.findOne({ email: TEST.email })) === null

  if (gone && delUser.deletedCount >= 1) {
    pass(37, 'CLEANUP', 'mongoose User.deleteOne', `test user removed (orders deleted: ${delOrder.deletedCount}, stock restored: ${state.orderCreated})`)
  } else {
    fail(37, 'CLEANUP', 'mongoose User.deleteOne', [`Test user could not be deleted (deletedCount=${delUser.deletedCount})`])
  }
  await mongoose.disconnect()
}

async function run() {
  console.log(`\nAMRIN API test suite → ${BASE_URL}\n${'═'.repeat(50)}`)

  // Confirm the server is reachable before doing anything
  const health = await http.get('/api/health').catch(e => ({ status: 0, err: e.message }))
  if (health.status !== 200) {
    console.error(`\n✗ Server not reachable at ${BASE_URL} (/api/health → ${health.status || health.err}).`)
    console.error('  Start it with:  node server.js   (or set API_BASE_URL)\n')
    process.exit(1)
  }

  await setup()

  /* ===== AUTH TESTS ===== */
  // 1. Register
  {
    const r = await http.post('/api/auth/register', TEST)
    if (r.status === 201 && r.data?.token) pass(1, 'POST', '/api/auth/register', '201 token received')
    else fail(1, 'POST', '/api/auth/register', [`Expected 201 + token, got ${r.status}`, `Error: ${r.data?.error || 'no token'}`])
  }

  // 2. Login → save token
  {
    const r = await http.post('/api/auth/login', { email: TEST.email, password: TEST.password })
    if (r.status === 200 && r.data?.token) { state.token = r.data.token; pass(2, 'POST', '/api/auth/login', '200 token received (saved)') }
    else fail(2, 'POST', '/api/auth/login', [`Expected 200 + token, got ${r.status}`, `Error: ${r.data?.error || 'no token'}`])
  }

  // 3. Get me
  {
    const r = await http.get('/api/auth/me', bearer(state.token))
    if (r.status === 200 && r.data?.user) pass(3, 'GET', '/api/auth/me', `200 user object returned (${r.data.user.email})`)
    else fail(3, 'GET', '/api/auth/me', [`Expected 200, got ${r.status}`, `Error: ${r.data?.error || 'no user in response'}`])
  }

  // 4. Login wrong password
  {
    const r = await http.post('/api/auth/login', { email: TEST.email, password: 'WrongPass!1' })
    if (r.status === 401) pass(4, 'POST', '/api/auth/login', '401 rejected wrong password')
    else fail(4, 'POST', '/api/auth/login', [`Expected 401, got ${r.status}`])
  }

  // 5. Register duplicate email
  {
    const r = await http.post('/api/auth/register', TEST)
    if (r.status === 400 && /already registered/i.test(r.data?.error || '')) pass(5, 'POST', '/api/auth/register', `400 "${r.data.error}"`)
    else fail(5, 'POST', '/api/auth/register', [`Expected 400 "Email already registered", got ${r.status}`, `Error: ${r.data?.error || 'none'}`])
  }

  /* ===== PRODUCT TESTS ===== */
  // 6. List products → save first product
  {
    const r = await http.get('/api/products')
    const list = r.data?.products
    if (r.status === 200 && Array.isArray(list) && list.length) {
      state.product = list.find(p => orderableSize(p)) || list[0]
      state.productId = state.product._id
      pass(6, 'GET', '/api/products', `200, ${list.length} products (saved id ${state.productId})`)
    } else fail(6, 'GET', '/api/products', [`Expected 200 + non-empty products array, got ${r.status} (count=${list?.length ?? 'n/a'})`])
  }

  // 7. Filter by category (spec said "women"; real API filters by category _id)
  {
    const cats = await http.get('/api/categories')
    const cat = cats.data?.categories?.find(c => /women/i.test(c.name)) || cats.data?.categories?.[0]
    const r = await http.get(`/api/products?category=${cat?._id || 'women'}`)
    if (r.status === 200 && Array.isArray(r.data?.products))
      pass(7, 'GET', '/api/products?category={id}', `200, ${r.data.products.length} filtered products (category "${cat?.name || 'n/a'}" _id used, not slug)`)
    else fail(7, 'GET', '/api/products?category={id}', [`Expected 200 + products array, got ${r.status}`, `Error: ${r.data?.error || 'none'}`])
  }

  // 8. Suggestions < 3 chars
  {
    const r = await http.get('/api/products/suggestions?q=dr')
    if (r.status === 400) pass(8, 'GET', '/api/products/suggestions?q=dr', '400 (query must be ≥ 3 chars)')
    else fail(8, 'GET', '/api/products/suggestions?q=dr', [`Expected 400, got ${r.status}`])
  }

  // 9. Suggestions ≥ 3 chars
  {
    const r = await http.get('/api/products/suggestions?q=dre')
    if (r.status === 200 && Array.isArray(r.data?.suggestions)) pass(9, 'GET', '/api/products/suggestions?q=dre', `200, ${r.data.suggestions.length} suggestions`)
    else fail(9, 'GET', '/api/products/suggestions?q=dre', [`Expected 200 + suggestions array, got ${r.status}`])
  }

  // 10. Featured
  {
    const r = await http.get('/api/products/featured')
    if (r.status === 200 && Array.isArray(r.data?.products)) pass(10, 'GET', '/api/products/featured', `200, ${r.data.products.length} featured products`)
    else fail(10, 'GET', '/api/products/featured', [`Expected 200 + products array, got ${r.status}`])
  }

  // 11. New arrivals
  {
    const r = await http.get('/api/products/new-arrivals')
    if (r.status === 200 && Array.isArray(r.data?.products)) pass(11, 'GET', '/api/products/new-arrivals', `200, ${r.data.products.length} new products`)
    else fail(11, 'GET', '/api/products/new-arrivals', [`Expected 200 + products array, got ${r.status}`])
  }

  /* ===== ORDER TESTS ===== */
  // 12. Create order → save orderId
  {
    const p = state.product || {}
    const ss = sizeStockOf(p)
    let size = orderableSize(p) || (ss ? Object.keys(ss)[0] : ((p.sizes && p.sizes.includes('M')) ? 'M' : (p.sizes?.[0] || 'M')))

    // Snapshot pristine stock (from the API response) so cleanup can restore it exactly —
    // placing the order decrements stock, and we may bump it below if the size is empty.
    state.bump = ss
      ? { id: p._id, set: { [`sizeStock.${size}`]: Number(ss[size] || 0), stock: Number(p.stock || 0) } }
      : { id: p._id, set: { stock: Number(p.stock || 0) } }

    // If the chosen size is out of stock on the live catalog, temporarily make it orderable.
    if (!orderableSize(p)) {
      const bumpSet = ss ? { [`sizeStock.${size}`]: 5, stock: Number(p.stock || 0) + 5 } : { stock: 5 }
      await Product.updateOne({ _id: p._id }, { $set: bumpSet })
    }
    const body = {
      customerName: TEST.name, email: TEST.email, phone: TEST.phone,
      shippingAddress: { addressLine1: '123 Test Street', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
      items: [{ productId: state.productId, name: p.name || 'Test Product', price: p.price || 999, qty: 1, size, color: p.colors?.[0] || 'Black' }],
      subtotal: p.price || 999, total: p.price || 999, paymentMethod: 'COD',
    }
    const r = await http.post('/api/orders', body)
    if (r.status === 201 && r.data?.orderId) { state.orderId = r.data.orderId; state.orderCreated = true; pass(12, 'POST', '/api/orders', `201 orderId ${state.orderId}`) }
    else fail(12, 'POST', '/api/orders', [`Expected 201 + orderId, got ${r.status}`, `Error: ${r.data?.error || JSON.stringify(r.data)}`])
  }

  // 13. Track order
  {
    const r = await http.get(`/api/orders/track?orderId=${encodeURIComponent(state.orderId || '')}&email=${encodeURIComponent(TEST.email)}`)
    if (r.status === 200 && r.data?.order) pass(13, 'GET', '/api/orders/track', `200 order returned (status: ${r.data.order.status})`)
    else fail(13, 'GET', '/api/orders/track', [`Expected 200 + order, got ${r.status}`, `Error: ${r.data?.error || 'none'}`])
  }

  // 14. Validate coupon — valid
  {
    const r = await http.post('/api/orders/validate-coupon', { code: 'FIRST10', orderTotal: 999 })
    if (r.status === 200 && r.data?.valid === true) pass(14, 'POST', '/api/orders/validate-coupon', `200 valid:true (₹${r.data.discountAmount} off)`)
    else fail(14, 'POST', '/api/orders/validate-coupon', [`Expected 200 valid:true, got ${r.status} valid:${r.data?.valid}`, `Msg: ${r.data?.message || 'none'}`])
  }

  // 15. Validate coupon — invalid
  {
    const r = await http.post('/api/orders/validate-coupon', { code: 'FAKECODE', orderTotal: 999 })
    if (r.status === 200 && r.data?.valid === false) pass(15, 'POST', '/api/orders/validate-coupon', '200 valid:false (unknown code)')
    else fail(15, 'POST', '/api/orders/validate-coupon', [`Expected 200 valid:false, got ${r.status} valid:${r.data?.valid}`])
  }

  /* ===== PROFILE TESTS ===== */
  // 16. Get profile
  {
    const r = await http.get('/api/profile', bearer(state.token))
    if (r.status === 200 && r.data?.user) pass(16, 'GET', '/api/profile', `200 user data (${r.data.user.email})`)
    else fail(16, 'GET', '/api/profile', [`Expected 200, got ${r.status}`])
  }

  // 17. Update profile
  {
    const r = await http.put('/api/profile', { name: 'Updated Name', phone: '8888888888' }, bearer(state.token))
    if (r.status === 200 && r.data?.user?.name === 'Updated Name') pass(17, 'PUT', '/api/profile', '200 updated user (name + phone)')
    else fail(17, 'PUT', '/api/profile', [`Expected 200 + updated user, got ${r.status}`, `Error: ${r.data?.error || 'none'}`])
  }

  // 18. Add address → save addressId
  {
    const body = { label: 'Home', fullName: 'Test User', phone: '9999999999', addressLine1: '123 Test Street', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', isDefault: true }
    const r = await http.post('/api/profile/addresses', body, bearer(state.token))
    const addrs = r.data?.addresses
    if (r.status === 201 && Array.isArray(addrs) && addrs.length) { state.addressId = addrs[addrs.length - 1]._id; pass(18, 'POST', '/api/profile/addresses', `201 address added (id ${state.addressId})`) }
    else fail(18, 'POST', '/api/profile/addresses', [`Expected 201 + addresses, got ${r.status}`, `Error: ${r.data?.error || 'none'}`])
  }

  // 19. Update address
  {
    const r = await http.put(`/api/profile/addresses/${state.addressId}`, { city: 'Mumbai' }, bearer(state.token))
    const updated = r.data?.addresses?.find(a => a._id === state.addressId)
    if (r.status === 200 && updated?.city === 'Mumbai') pass(19, 'PUT', '/api/profile/addresses/{id}', '200 address updated (city → Mumbai)')
    else fail(19, 'PUT', '/api/profile/addresses/{id}', [`Expected 200 + city Mumbai, got ${r.status}`, `Error: ${r.data?.error || 'none'}`])
  }

  // 20. Set default address
  {
    const r = await http.patch(`/api/profile/addresses/${state.addressId}/default`, {}, bearer(state.token))
    if (r.status === 200) pass(20, 'PATCH', '/api/profile/addresses/{id}/default', '200 default set')
    else fail(20, 'PATCH', '/api/profile/addresses/{id}/default', [`Expected 200, got ${r.status}`])
  }

  // 21. Delete address
  {
    const r = await http.delete(`/api/profile/addresses/${state.addressId}`, bearer(state.token))
    if (r.status === 200) pass(21, 'DELETE', '/api/profile/addresses/{id}', '200 address removed')
    else fail(21, 'DELETE', '/api/profile/addresses/{id}', [`Expected 200, got ${r.status}`])
  }

  /* ===== MY ORDERS TESTS ===== */
  // 22. My orders (order from #12 should appear)
  {
    const r = await http.get('/api/my-orders', bearer(state.token))
    const orders = r.data?.orders
    const found = Array.isArray(orders) && orders.some(o => o.orderId === state.orderId)
    if (r.status === 200 && found) pass(22, 'GET', '/api/my-orders', `200, ${orders.length} orders (test order present)`)
    else fail(22, 'GET', '/api/my-orders', [`Expected 200 with test order, got ${r.status}`, found ? '' : 'Test order not found in list'].filter(Boolean))
  }

  // 23. My order detail
  {
    const r = await http.get(`/api/my-orders/${encodeURIComponent(state.orderId || '')}`, bearer(state.token))
    if (r.status === 200 && r.data?.order?.orderId === state.orderId) pass(23, 'GET', '/api/my-orders/{id}', '200 full order detail')
    else fail(23, 'GET', '/api/my-orders/{id}', [`Expected 200 + order detail, got ${r.status}`])
  }

  /* ===== CATEGORY / BANNER / SETTINGS ===== */
  // 24. Categories
  {
    const r = await http.get('/api/categories')
    if (r.status === 200 && Array.isArray(r.data?.categories)) pass(24, 'GET', '/api/categories', `200, ${r.data.categories.length} categories`)
    else fail(24, 'GET', '/api/categories', [`Expected 200 + categories array, got ${r.status}`])
  }

  // 25. Banners
  {
    const r = await http.get('/api/banners')
    if (r.status === 200 && Array.isArray(r.data?.banners)) pass(25, 'GET', '/api/banners', `200, ${r.data.banners.length} active banners`)
    else fail(25, 'GET', '/api/banners', [`Expected 200 + banners array, got ${r.status}`])
  }

  // 26. Settings
  {
    const r = await http.get('/api/settings')
    if (r.status === 200 && r.data?.settings) pass(26, 'GET', '/api/settings', `200 store settings (${r.data.settings.storeName || 'n/a'})`)
    else fail(26, 'GET', '/api/settings', [`Expected 200 + settings, got ${r.status}`])
  }

  /* ===== ADMIN TESTS (JWT Bearer + role:admin, not x-admin-key) ===== */
  // Prerequisite: obtain an admin JWT
  {
    const r = await http.post('/api/auth/login', { email: ADMIN.email, password: ADMIN.password })
    if (r.status === 200 && r.data?.token) state.adminToken = r.data.token
    else console.log(`         (admin login failed: ${r.status} — admin tests will fail)`)
  }

  // 27. Dashboard
  {
    const r = await http.get('/api/admin/dashboard', bearer(state.adminToken))
    if (r.status === 200 && r.data?.success) pass(27, 'GET', '/api/admin/dashboard', `200 dashboard (orders: ${r.data.totalOrders}, revenue: ₹${r.data.totalRevenue})`)
    else fail(27, 'GET', '/api/admin/dashboard', [`Expected 200, got ${r.status}`, `Error: ${r.data?.error || 'none'}`])
  }

  // 28. All orders
  {
    const r = await http.get('/api/admin/orders', bearer(state.adminToken))
    if (r.status === 200 && Array.isArray(r.data?.orders)) pass(28, 'GET', '/api/admin/orders', `200, ${r.data.total} total orders`)
    else fail(28, 'GET', '/api/admin/orders', [`Expected 200 + orders array, got ${r.status}`])
  }

  // 29. Update order status
  {
    const r = await http.patch(`/api/admin/orders/${encodeURIComponent(state.orderId || '')}/status`, { status: 'confirmed', note: 'Auto test confirmation' }, bearer(state.adminToken))
    if (r.status === 200 && r.data?.order?.status === 'confirmed') pass(29, 'PATCH', '/api/admin/orders/{id}/status', '200 status → confirmed')
    else fail(29, 'PATCH', '/api/admin/orders/{id}/status', [`Expected 200 + status confirmed, got ${r.status}`, `Error: ${r.data?.error || 'none'}`])
  }

  // 30. Admin products
  {
    const r = await http.get('/api/admin/products', bearer(state.adminToken))
    if (r.status === 200 && Array.isArray(r.data?.products)) pass(30, 'GET', '/api/admin/products', `200, ${r.data.total} products`)
    else fail(30, 'GET', '/api/admin/products', [`Expected 200 + products array, got ${r.status}`])
  }

  // 31. Returns
  {
    const r = await http.get('/api/admin/returns', bearer(state.adminToken))
    if (r.status === 200) pass(31, 'GET', '/api/admin/returns', `200 (${r.data?.total ?? r.data?.returns?.length ?? 0} returns)`)
    else fail(31, 'GET', '/api/admin/returns', [`Expected 200, got ${r.status}`])
  }

  // 32. Pending wallet credits
  {
    const r = await http.get('/api/admin/wallet/pending', bearer(state.adminToken))
    if (r.status === 200) pass(32, 'GET', '/api/admin/wallet/pending', `200 (${r.data?.total ?? 0} pending)`)
    else fail(32, 'GET', '/api/admin/wallet/pending', [`Expected 200, got ${r.status}`])
  }

  /* ===== SECURITY TESTS ===== */
  // 33. Profile, no token
  {
    const r = await http.get('/api/profile')
    if (r.status === 401) pass(33, 'GET', '/api/profile', '401 (no token)')
    else fail(33, 'GET', '/api/profile', [`Expected 401, got ${r.status}`])
  }

  // 34. Admin dashboard, no token/key
  {
    const r = await http.get('/api/admin/dashboard')
    if (r.status === 401) pass(34, 'GET', '/api/admin/dashboard', '401 (no auth)')
    else fail(34, 'GET', '/api/admin/dashboard', [`Expected 401, got ${r.status}`])
  }

  // 35. Admin dashboard, wrong "admin key" (header is ignored; no Bearer → 401)
  {
    const r = await http.get('/api/admin/dashboard', bearer(null, { 'x-admin-key': 'wrongkey' }))
    if (r.status === 401) pass(35, 'GET', '/api/admin/dashboard', '401 (x-admin-key ignored, no Bearer)')
    else fail(35, 'GET', '/api/admin/dashboard', [`Expected 401, got ${r.status}`])
  }

  // 36. My orders, no token
  {
    const r = await http.get('/api/my-orders')
    if (r.status === 401) pass(36, 'GET', '/api/my-orders', '401 (no token)')
    else fail(36, 'GET', '/api/my-orders', [`Expected 401, got ${r.status}`])
  }

  /* ===== CLEANUP ===== */
  await cleanup()

  /* ===== SUMMARY ===== */
  const total  = results.length
  const passed = results.filter(r => r.ok).length
  const failed = total - passed
  console.log('\n─────────────────────────')
  console.log(`Total:  ${total}`)
  console.log(`Passed: ${passed} ✓`)
  console.log(`Failed: ${failed} ✗`)
  console.log('─────────────────────────')
  if (failed) {
    console.log('Failed tests:')
    results.filter(r => !r.ok).forEach(r => console.log(`  [${r.i}] ${r.method} ${r.path}`))
  } else {
    console.log('All tests passed ✓')
  }
  process.exit(failed ? 1 : 0)
}

run().catch(async (err) => {
  console.error('\nFatal error:', err.message)
  try { await mongoose.disconnect() } catch {}
  process.exit(1)
})
