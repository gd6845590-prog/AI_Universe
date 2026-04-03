import { createContext, useContext, useState, useEffect } from 'react'
import api from '@/lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading

  // Restore session from httpOnly cookie on mount
  useEffect(() => {
    api.get('/auth/me')
      .then((r) => setUser(r.data))
      .catch(() => setUser(null))
  }, [])

  const formatError = (e) => {
    const d = e.response?.data?.detail
    if (!d) return e.message || 'Something went wrong'
    if (typeof d === 'string') return d
    if (Array.isArray(d)) return d.map((x) => x.msg || JSON.stringify(x)).join(' ')
    return String(d)
  }

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setUser(data)
      return data
    } catch (err) {
      const status = err?.response?.status
      if (status === 404 || status === 405) {
        const { data } = await api.post('/login', { email, password })
        setUser(data)
        return data
      }
      throw err
    }
  }

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      setUser(data)
      return data
    } catch (err) {
      const status = err?.response?.status
      if (status === 404 || status === 405) {
        const { data } = await api.post('/auth/signup', { name, email, password })
        setUser(data)
        return data
      }
      throw err
    }
  }

  const logout = async () => {
    await api.post('/auth/logout')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, formatError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
