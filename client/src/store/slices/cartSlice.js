import { createSlice } from '@reduxjs/toolkit'

const CART_KEY = 'amrin_cart'

const loadCart = () => {
  try {
    // Migrate users who had data under the old key
    const old = localStorage.getItem('luxe_cart')
    if (old) {
      localStorage.setItem(CART_KEY, old)
      localStorage.removeItem('luxe_cart')
    }
    const data = localStorage.getItem(CART_KEY)
    return data ? JSON.parse(data) : { items: [], couponCode: '', discountAmount: 0 }
  } catch {
    return { items: [], couponCode: '', discountAmount: 0 }
  }
}

const saveCart = (state) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify({
      items: state.items,
      couponCode: state.couponCode,
      discountAmount: state.discountAmount,
    }))
  } catch {}
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: loadCart(),
  reducers: {
    addToCart: (state, action) => {
      const { id, size, color } = action.payload
      const existing = state.items.find(
        (item) => item.id === id && item.size === size && item.color === color
      )
      if (existing) {
        existing.qty += 1
      } else {
        state.items.push({ ...action.payload, qty: action.payload.qty || 1 })
      }
      saveCart(state)
    },
    removeFromCart: (state, action) => {
      const { id, size, color } = action.payload
      state.items = state.items.filter(
        (item) => !(item.id === id && item.size === size && item.color === color)
      )
      saveCart(state)
    },
    updateQty: (state, action) => {
      const { id, size, color, qty } = action.payload
      const item = state.items.find(
        (i) => i.id === id && i.size === size && i.color === color
      )
      if (item) {
        if (qty <= 0) {
          state.items = state.items.filter(
            (i) => !(i.id === id && i.size === size && i.color === color)
          )
        } else {
          item.qty = qty
        }
      }
      saveCart(state)
    },
    // payload: { code, discountAmount } — values come from /api/orders/validate-coupon
    applyCoupon: (state, action) => {
      state.couponCode = action.payload.code
      state.discountAmount = action.payload.discountAmount
      saveCart(state)
    },
    removeCoupon: (state) => {
      state.couponCode = ''
      state.discountAmount = 0
      saveCart(state)
    },
    clearCart: (state) => {
      state.items = []
      state.couponCode = ''
      state.discountAmount = 0
      saveCart(state)
    },
  },
})

export const { addToCart, removeFromCart, updateQty, applyCoupon, removeCoupon, clearCart } = cartSlice.actions

export const selectCartItems = (state) => state.cart.items
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.qty, 0)
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.qty, 0)
export const selectDiscountedTotal = (state) => {
  const total = selectCartTotal(state)
  const discountAmount = state.cart.discountAmount || 0
  return Math.max(0, total - discountAmount)
}
export const selectCoupon = (state) => ({
  code: state.cart.couponCode,
  discountAmount: state.cart.discountAmount || 0,
})

export default cartSlice.reducer
