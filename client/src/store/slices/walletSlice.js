import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getWallet, applyWallet } from '../../utils/walletApi'

export const fetchWallet = createAsyncThunk(
  'wallet/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getWallet()
      return data.wallet
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to load wallet')
    }
  }
)

export const applyWalletBalance = createAsyncThunk(
  'wallet/apply',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await applyWallet(payload)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to apply wallet balance')
    }
  }
)

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    balance:      0,
    transactions: [],
    loading:      false,
    applying:     false,
    error:        null,
  },
  reducers: {
    clearWalletError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.pending,  (s) => { s.loading = true; s.error = null })
      .addCase(fetchWallet.fulfilled,(s, { payload }) => {
        s.loading      = false
        s.balance      = payload.balance
        s.transactions = payload.transactions
      })
      .addCase(fetchWallet.rejected, (s, { payload }) => { s.loading = false; s.error = payload })

      .addCase(applyWalletBalance.pending,   (s) => { s.applying = true })
      .addCase(applyWalletBalance.fulfilled, (s, { payload }) => {
        s.applying = false
        s.balance  = payload.remainingBalance
      })
      .addCase(applyWalletBalance.rejected,  (s, { payload }) => { s.applying = false; s.error = payload })
  },
})

export const { clearWalletError } = walletSlice.actions
export default walletSlice.reducer
