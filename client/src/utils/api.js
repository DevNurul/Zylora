import axios from 'axios'
import { TOKEN_KEY } from './authApi'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// ── Attach Bearer token to every request ──────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Handle 401 responses ──────────────────────────────────────────────────────
// When the server returns 401 the JWT is expired or invalid.  Remove the stale
// token from localStorage so ProtectedRoute detects the missing token on its
// next render and redirects to /auth.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
    }
    return Promise.reject(err)
  }
)

// ── Product normaliser ────────────────────────────────────────────────────────
export const normalizeProduct = (p) => ({
  ...p,
  id:          p._id,
  category:    p.category?.name || p.category || '',
  images:      (p.images || []).map((img) => (typeof img === 'string' ? img : img.url)),
  isSale:      !!(p.originalPrice && p.originalPrice > p.price),
  inStock:     (p.stock ?? 1) > 0,
  rating:      p.rating     ?? 4.5,
  reviewCount: p.reviewCount ?? 0,
})

// ── Profile API ───────────────────────────────────────────────────────────────

export const getProfile = () => api.get('/profile/')

export const updateProfile = (data) => api.put('/profile/', data)

export const uploadProfileImage = (file) => {
  const form = new FormData()
  form.append('profileImage', file)
  return api.post('/profile/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const deleteProfileImage = () => api.delete('/profile/image')

// ── Product search suggestions ────────────────────────────────────────────────
export const getSearchSuggestions = (query) =>
  api.get('/products/suggestions', { params: { q: query } })

export default api
