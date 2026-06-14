import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  getProfile       as apiGetProfile,
  updateProfile    as apiUpdateProfile,
  addAddress       as apiAddAddress,
  updateAddress    as apiUpdateAddress,
  deleteAddress    as apiDeleteAddress,
  setDefaultAddress as apiSetDefault,
} from '../../utils/profileApi'

/* ── Thunks ──────────────────────────────────────────────────────────────────── */

export const fetchProfile = createAsyncThunk(
  'profile/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiGetProfile()
      return data.user
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to load profile')
    }
  }
)

export const updateUserProfile = createAsyncThunk(
  'profile/update',
  async (updates, { rejectWithValue }) => {
    try {
      const { data } = await apiUpdateProfile(updates)
      return data.user
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to update profile')
    }
  }
)

export const addUserAddress = createAsyncThunk(
  'profile/addAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const { data } = await apiAddAddress(addressData)
      return data.addresses
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to add address')
    }
  }
)

export const updateUserAddress = createAsyncThunk(
  'profile/updateAddress',
  async ({ id, data: addressData }, { rejectWithValue }) => {
    try {
      const { data } = await apiUpdateAddress(id, addressData)
      return data.addresses
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to update address')
    }
  }
)

export const deleteUserAddress = createAsyncThunk(
  'profile/deleteAddress',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await apiDeleteAddress(id)
      return data.addresses
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to delete address')
    }
  }
)

export const setUserDefaultAddress = createAsyncThunk(
  'profile/setDefault',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await apiSetDefault(id)
      return data.addresses
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to update default address')
    }
  }
)

/* ── Slice ───────────────────────────────────────────────────────────────────── */

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    user:      null,
    addresses: [],
    loading:   false,
    updating:  false,
    error:     null,
  },
  reducers: {
    clearProfile(state) {
      state.user      = null
      state.addresses = []
      state.loading   = false
      state.updating  = false
      state.error     = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProfile
      .addCase(fetchProfile.pending,  (s) => { s.loading = true; s.error = null })
      .addCase(fetchProfile.fulfilled,(s, { payload }) => {
        s.loading   = false
        s.user      = payload
        s.addresses = payload.addresses || []
      })
      .addCase(fetchProfile.rejected, (s, { payload }) => { s.loading = false; s.error = payload })

      // updateUserProfile
      .addCase(updateUserProfile.pending,   (s) => { s.updating = true; s.error = null })
      .addCase(updateUserProfile.fulfilled, (s, { payload }) => {
        s.updating = false
        if (s.user) { s.user.name = payload.name; s.user.phone = payload.phone }
      })
      .addCase(updateUserProfile.rejected,  (s, { payload }) => { s.updating = false; s.error = payload })

      // addUserAddress
      .addCase(addUserAddress.pending,   (s) => { s.updating = true; s.error = null })
      .addCase(addUserAddress.fulfilled, (s, { payload }) => { s.updating = false; s.addresses = payload })
      .addCase(addUserAddress.rejected,  (s, { payload }) => { s.updating = false; s.error = payload })

      // updateUserAddress
      .addCase(updateUserAddress.pending,   (s) => { s.updating = true; s.error = null })
      .addCase(updateUserAddress.fulfilled, (s, { payload }) => { s.updating = false; s.addresses = payload })
      .addCase(updateUserAddress.rejected,  (s, { payload }) => { s.updating = false; s.error = payload })

      // deleteUserAddress
      .addCase(deleteUserAddress.pending,   (s) => { s.updating = true; s.error = null })
      .addCase(deleteUserAddress.fulfilled, (s, { payload }) => { s.updating = false; s.addresses = payload })
      .addCase(deleteUserAddress.rejected,  (s, { payload }) => { s.updating = false; s.error = payload })

      // setUserDefaultAddress
      .addCase(setUserDefaultAddress.pending,   (s) => { s.updating = true; s.error = null })
      .addCase(setUserDefaultAddress.fulfilled, (s, { payload }) => { s.updating = false; s.addresses = payload })
      .addCase(setUserDefaultAddress.rejected,  (s, { payload }) => { s.updating = false; s.error = payload })
  },
})

export const { clearProfile } = profileSlice.actions
export default profileSlice.reducer
