import api from './api'

export const getProfile         = ()         => api.get('/profile')
export const updateProfile      = (data)     => api.put('/profile', data)
export const addAddress         = (data)     => api.post('/profile/addresses', data)
export const updateAddress      = (id, data) => api.put(`/profile/addresses/${id}`, data)
export const deleteAddress      = (id)       => api.delete(`/profile/addresses/${id}`)
export const setDefaultAddress  = (id)       => api.patch(`/profile/addresses/${id}/default`)
export const uploadProfileImage = (file)     => {
  const form = new FormData()
  form.append('profileImage', file)
  return api.post('/profile/image', form, { headers: { 'Content-Type': 'multipart/form-data' } })
}
export const deleteProfileImage = () => api.delete('/profile/image')
