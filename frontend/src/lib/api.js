import axios from 'axios'

// Use local proxy in dev. In production, require explicit backend URL.
const configuredBaseURL = (import.meta.env.VITE_API_BASE_URL || '').trim()
const apiBaseURL = configuredBaseURL || (import.meta.env.DEV ? '/api' : '')

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
    if (!apiBaseURL && import.meta.env.PROD) {
      err.message = 'Missing VITE_API_BASE_URL for production deployment'
      return Promise.reject(err)
    }
    if (err.response?.status === 401 && !original._retry && !original.url?.includes('/auth/')) {
      original._retry = true
      try {
        await api.post('/auth/refresh', {})
        return api(original)
      } catch {
        // refresh failed — let caller handle
      }
    }
    return Promise.reject(err)
  }
)

export default api
