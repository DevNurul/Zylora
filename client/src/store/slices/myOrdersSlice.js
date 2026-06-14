import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getMyOrders, getMyOrderById } from '../../utils/myOrdersApi'

export const fetchMyOrders = createAsyncThunk(
  'myOrders/fetchAll',
  async ({ page = 1, status = 'all' } = {}, { rejectWithValue }) => {
    try {
      const params = { page, limit: 10 }
      if (status && status !== 'all') params.status = status
      const { data } = await getMyOrders(params)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to load orders')
    }
  }
)

export const fetchMyOrderById = createAsyncThunk(
  'myOrders/fetchOne',
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await getMyOrderById(orderId)
      return data.order
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Order not found')
    }
  }
)

const myOrdersSlice = createSlice({
  name: 'myOrders',
  initialState: {
    orders:        [],
    selectedOrder: null,
    loading:       false,
    detailLoading: false,
    error:         null,
    totalOrders:   0,
    totalPages:    1,
    currentPage:   1,
    hasNextPage:   false,
    hasPrevPage:   false,
    activeFilter:  'all',
  },
  reducers: {
    setActiveFilter(state, { payload }) {
      state.activeFilter = payload
      state.currentPage  = 1
    },
    clearSelectedOrder(state) {
      state.selectedOrder = null
      state.error         = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending,  (s) => { s.loading = true;  s.error = null })
      .addCase(fetchMyOrders.fulfilled,(s, { payload }) => {
        s.loading      = false
        s.orders       = payload.orders
        s.totalOrders  = payload.totalOrders
        s.totalPages   = payload.totalPages
        s.currentPage  = payload.currentPage
        s.hasNextPage  = payload.hasNextPage
        s.hasPrevPage  = payload.hasPrevPage
      })
      .addCase(fetchMyOrders.rejected, (s, { payload }) => { s.loading = false; s.error = payload })

      .addCase(fetchMyOrderById.pending,  (s) => { s.detailLoading = true; s.selectedOrder = null; s.error = null })
      .addCase(fetchMyOrderById.fulfilled,(s, { payload }) => { s.detailLoading = false; s.selectedOrder = payload })
      .addCase(fetchMyOrderById.rejected, (s, { payload }) => { s.detailLoading = false; s.error = payload })
  },
})

export const { setActiveFilter, clearSelectedOrder } = myOrdersSlice.actions
export default myOrdersSlice.reducer
