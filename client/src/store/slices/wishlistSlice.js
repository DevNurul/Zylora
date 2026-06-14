import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit'
import api, { normalizeProduct } from '../../utils/api'

const STORAGE_KEY = 'amrin_wishlist'

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

const saveToStorage = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

export const resetWishlist = createAction('wishlist/reset')

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const localItems  = loadFromStorage()
      const { data }    = await api.get('/wishlist')
      const serverItems = (data.products || []).map(normalizeProduct)
      const serverIds   = new Set(serverItems.map((i) => i.id))

      const unsynced = localItems.filter((i) => i.id && !serverIds.has(i.id))
      if (unsynced.length > 0) {
        Promise.allSettled(unsynced.map((i) => api.post(`/wishlist/${i.id}`)))
      }

      const merged = [...serverItems]
      unsynced.forEach((i) => merged.push(i))
      return merged
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'fetch_failed')
    }
  }
)

export const serverToggleWishlist = createAsyncThunk(
  'wishlist/serverToggle',
  async ({ productId, isLiked }, { rejectWithValue }) => {
    try {
      if (isLiked) {
        await api.delete(`/wishlist/${productId}`)
      } else {
        await api.post(`/wishlist/${productId}`)
      }
      return { productId, wasLiked: isLiked }
    } catch (err) {
      return rejectWithValue({ productId, wasLiked: isLiked, error: err.response?.data?.error })
    }
  }
)

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items:   loadFromStorage(),
    loading: false,
    synced:  false,
  },
  reducers: {
    toggleItem(state, { payload: product }) {
      const id  = product.id || product._id
      const idx = state.items.findIndex((i) => (i.id || i._id) === id)
      if (idx >= 0) {
        state.items.splice(idx, 1)
      } else {
        state.items.push(product)
      }
      saveToStorage(state.items)
    },
    removeItem(state, { payload: productId }) {
      state.items = state.items.filter((i) => (i.id || i._id) !== productId)
      saveToStorage(state.items)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (s) => { s.loading = true })
      .addCase(fetchWishlist.fulfilled, (s, { payload }) => {
        s.items   = payload
        s.loading = false
        s.synced  = true
        saveToStorage(payload)
      })
      .addCase(fetchWishlist.rejected, (s) => {
        s.loading = false
        s.synced  = true
      })
      .addCase(resetWishlist, (s) => {
        s.items  = []
        s.synced = false
        saveToStorage([])
      })
  },
})

export const { toggleItem, removeItem } = wishlistSlice.actions

export const selectWishlistItems   = (s) => s.wishlist.items
export const selectWishlistCount   = (s) => s.wishlist.items.length
export const selectWishlistLoading = (s) => s.wishlist.loading
export const selectWishlistSynced  = (s) => s.wishlist.synced
export const selectIsWishlisted    = (id) => (s) =>
  s.wishlist.items.some((i) => (i.id || i._id) === id)

export default wishlistSlice.reducer
