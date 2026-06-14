import api from './api'

export const submitReturnRequest    = (data)            => api.post('/returns', data)
export const getMyReturnRequests    = ()                => api.get('/returns/my-requests')
export const getReturnById          = (returnId)        => api.get(`/returns/${returnId}`)
export const cancelReturnRequest    = (returnId)        => api.patch(`/returns/${returnId}/cancel`)
export const getEligibleProducts    = (params)          => api.get('/returns/eligible-products', { params })
export const initiateReturnPayment  = (returnId)        => api.post(`/returns/${returnId}/initiate-payment`)
export const verifyReturnPayment    = (transactionId)   => api.get(`/returns/verify-payment/${transactionId}`)
