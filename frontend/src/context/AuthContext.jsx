import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const token   = localStorage.getItem('access_token')
    const role    = localStorage.getItem('role')
    const user_id = localStorage.getItem('user_id')
    if (token && role) {
      setUser({ token, role, user_id })
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { access_token, role, user_id } = res.data
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('role', role)
    localStorage.setItem('user_id', user_id)
    setUser({ token: access_token, role, user_id })
    return role
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
