import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    cartOpen: false,
    mobileMenuOpen: false,
  },
  reducers: {
    toggleCart: (state) => {
      state.cartOpen = !state.cartOpen
    },
    closeCart: (state) => {
      state.cartOpen = false
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen
    },
    closeMobileMenu: (state) => {
      state.mobileMenuOpen = false
    },
  },
})

export const { toggleCart, closeCart, toggleMobileMenu, closeMobileMenu } = uiSlice.actions
export default uiSlice.reducer
