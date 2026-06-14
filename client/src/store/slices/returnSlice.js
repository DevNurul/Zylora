import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  getMyReturnRequests,
  submitReturnRequest,
  getReturnById,
  cancelReturnRequest,
  getEligibleProducts,
  initiateReturnPayment,
  verifyReturnPayment,
} from '../../utils/returnApi'

export const fetchMyReturnRequests = createAsyncThunk(
  'returns/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getMyReturnRequests()
      return data.requests
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to load requests')
    }
  }
)

export const submitReturn = createAsyncThunk(
  'returns/submit',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await submitReturnRequest(formData)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to submit request')
    }
  }
)

export const fetchReturnById = createAsyncThunk(
  'returns/fetchOne',
  async (returnId, { rejectWithValue }) => {
    try {
      const { data } = await getReturnById(returnId)
      return data.request
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Request not found')
    }
  }
)

export const cancelReturn = createAsyncThunk(
  'returns/cancel',
  async (returnId, { rejectWithValue }) => {
    try {
      await cancelReturnRequest(returnId)
      return returnId
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to cancel request')
    }
  }
)

export const fetchEligibleProducts = createAsyncThunk(
  'returns/fetchEligibleProducts',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await getEligibleProducts(params)
      return data.products
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to load products')
    }
  }
)

export const initiateReturnPaymentThunk = createAsyncThunk(
  'returns/initiatePayment',
  async (returnId, { rejectWithValue }) => {
    try {
      const { data } = await initiateReturnPayment(returnId)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to initiate payment')
    }
  }
)

export const verifyReturnPaymentThunk = createAsyncThunk(
  'returns/verifyPayment',
  async (transactionId, { rejectWithValue }) => {
    try {
      const { data } = await verifyReturnPayment(transactionId)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to verify payment')
    }
  }
)

const returnSlice = createSlice({
  name: 'returns',
  initialState: {
    requests:         [],
    selectedRequest:  null,
    loading:          false,
    submitting:       false,
    error:            null,
    eligibleProducts: [],
    productsLoading:  false,
    paymentLoading:   false,
  },
  reducers: {
    clearSelectedRequest(state) { state.selectedRequest = null },
    clearEligibleProducts(state) { state.eligibleProducts = [] },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyReturnRequests.pending,  (s) => { s.loading = true;  s.error = null })
      .addCase(fetchMyReturnRequests.fulfilled,(s, { payload }) => { s.loading = false; s.requests = payload })
      .addCase(fetchMyReturnRequests.rejected, (s, { payload }) => { s.loading = false; s.error = payload })

      .addCase(submitReturn.pending,   (s) => { s.submitting = true;  s.error = null })
      .addCase(submitReturn.fulfilled, (s, { payload }) => {
        s.submitting = false
        s.requests.unshift({
          returnId:        payload.returnId,
          type:            payload.type,
          status:          payload.status,
          refundAmount:    payload.refundAmount,
          priceDifference: payload.priceDifference,
          itemCount:       0,
          items:           [],
        })
      })
      .addCase(submitReturn.rejected,  (s, { payload }) => { s.submitting = false; s.error = payload })

      .addCase(fetchReturnById.pending,   (s) => { s.loading = true })
      .addCase(fetchReturnById.fulfilled, (s, { payload }) => { s.loading = false; s.selectedRequest = payload })
      .addCase(fetchReturnById.rejected,  (s, { payload }) => { s.loading = false; s.error = payload })

      .addCase(cancelReturn.fulfilled, (s, { payload: returnId }) => {
        const r = s.requests.find(x => x.returnId === returnId)
        if (r) r.status = 'cancelled'
        if (s.selectedRequest?.returnId === returnId) s.selectedRequest.status = 'cancelled'
      })

      .addCase(fetchEligibleProducts.pending,   (s) => { s.productsLoading = true })
      .addCase(fetchEligibleProducts.fulfilled, (s, { payload }) => { s.productsLoading = false; s.eligibleProducts = payload })
      .addCase(fetchEligibleProducts.rejected,  (s) => { s.productsLoading = false })

      .addCase(initiateReturnPaymentThunk.pending,  (s) => { s.paymentLoading = true })
      .addCase(initiateReturnPaymentThunk.fulfilled,(s) => { s.paymentLoading = false })
      .addCase(initiateReturnPaymentThunk.rejected, (s) => { s.paymentLoading = false })
  },
})

export const { clearSelectedRequest, clearEligibleProducts } = returnSlice.actions
export default returnSlice.reducer
