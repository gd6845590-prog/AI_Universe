import axios from 'axios'

// In production, point to deployed backend via VITE_API_BASE_URL.
// In local dev, keep /api so Vite proxy forwards to localhost:8000.
const apiBaseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true, // send cookies (httpOnly JWT)
  headers: { 'Content-Type': 'application/json' },
})

// Auto-refresh if 401 (token expired)
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry && !original.url?.includes('/auth/')) {
      original._retry = true
      try {
        await axios.post('/api/auth/refresh', {}, { withCredentials: true })
        return api(original)
      } catch {
        // refresh failed — let caller handle
      }
    }
    return Promise.reject(err)
  }
)

export default api
