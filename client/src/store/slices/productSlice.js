import { createSlice } from '@reduxjs/toolkit'

const productSlice = createSlice({
  name: 'product',
  initialState: {
    products: [],
    filtered: [],
    categories: [],
    selectedCategory: 'all',
    searchQuery: '',
    sortBy: 'newest',
    priceRange: [500, 10000],
    selectedSizes: [],
    selectedColors: [],
    loading: false,
  },
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload
      state.filtered = action.payload
      const cats = ['all', ...new Set(action.payload.map((p) => p.category))]
      state.categories = cats
    },
    setCategory: (state, action) => {
      state.selectedCategory = action.payload
      productSlice.caseReducers.filterProducts(state)
    },
    setSearch: (state, action) => {
      state.searchQuery = action.payload
      productSlice.caseReducers.filterProducts(state)
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload
      productSlice.caseReducers.filterProducts(state)
    },
    setPriceRange: (state, action) => {
      state.priceRange = action.payload
      productSlice.caseReducers.filterProducts(state)
    },
    toggleSize: (state, action) => {
      const size = action.payload
      if (state.selectedSizes.includes(size)) {
        state.selectedSizes = state.selectedSizes.filter((s) => s !== size)
      } else {
        state.selectedSizes.push(size)
      }
      productSlice.caseReducers.filterProducts(state)
    },
    toggleColor: (state, action) => {
      const color = action.payload
      if (state.selectedColors.includes(color)) {
        state.selectedColors = state.selectedColors.filter((c) => c !== color)
      } else {
        state.selectedColors.push(color)
      }
      productSlice.caseReducers.filterProducts(state)
    },
    clearFilters: (state) => {
      state.selectedCategory = 'all'
      state.searchQuery = ''
      state.sortBy = 'newest'
      state.priceRange = [500, 10000]
      state.selectedSizes = []
      state.selectedColors = []
      state.filtered = state.products
    },
    filterProducts: (state) => {
      let result = [...state.products]

      if (state.selectedCategory !== 'all') {
        result = result.filter((p) => p.category === state.selectedCategory)
      }

      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase()
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        )
      }

      result = result.filter(
        (p) => p.price >= state.priceRange[0] && p.price <= state.priceRange[1]
      )

      if (state.selectedSizes.length > 0) {
        result = result.filter((p) =>
          state.selectedSizes.some((s) => p.sizes.includes(s))
        )
      }

      if (state.selectedColors.length > 0) {
        result = result.filter((p) =>
          state.selectedColors.some((c) => p.colors.includes(c))
        )
      }

      switch (state.sortBy) {
        case 'price_asc':
          result.sort((a, b) => a.price - b.price)
          break
        case 'price_desc':
          result.sort((a, b) => b.price - a.price)
          break
        case 'rating':
          result.sort((a, b) => b.rating - a.rating)
          break
        case 'sale':
          result = result.filter((p) => p.isSale).concat(result.filter((p) => !p.isSale))
          break
        default:
          result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
      }

      state.filtered = result
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
  },
})

export const {
  setProducts, setCategory, setSearch, setSortBy,
  setPriceRange, toggleSize, toggleColor, clearFilters, setLoading,
} = productSlice.actions

export default productSlice.reducer
