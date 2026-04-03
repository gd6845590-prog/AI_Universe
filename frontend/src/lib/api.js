import axios from 'axios'

// Use configured backend URL when provided; otherwise default to /api.
const configuredBaseURL = (import.meta.env.VITE_API_BASE_URL || '').trim()
const apiBaseURL = configuredBaseURL || '/api'

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
