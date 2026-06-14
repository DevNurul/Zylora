import api from './api'

export const getWallet    = ()     => api.get('/wallet')
export const applyWallet  = (data) => api.post('/wallet/apply', data)
