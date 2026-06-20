import api from './api'

export const getMyOrders    = (params) => api.get('/my-orders', { params })
export const getMyOrderById = (orderId) => api.get(`/my-orders/${orderId}`)
export const cancelMyOrder  = (orderId) => api.patch(`/my-orders/${orderId}/cancel`)
