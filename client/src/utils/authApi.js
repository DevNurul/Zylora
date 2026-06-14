import axios from 'axios'

export const TOKEN_KEY = 'token'

const authApi = axios.create({
  baseURL: '/api/auth',
})

authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const registerUser      = (data) => authApi.post('/register', data)
export const loginWithPassword = (data) => authApi.post('/login', data)
export const sendOTP           = (data) => authApi.post('/send-otp', data)
export const verifyOTP         = (data) => authApi.post('/verify-otp', data)
export const logoutApi         = ()     => authApi.post('/logout')
export const getMe             = ()     => authApi.get('/me')

export default authApi
