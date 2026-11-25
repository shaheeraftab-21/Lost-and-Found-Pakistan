import { createContext, useContext, useEffect, useState } from 'react'
import { api } from './api'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/auth/me').then(setUser).catch(() => setUser(null)).finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => setUser(await api.post('/auth/login', { email, password }))
  const register = async (data) => setUser(await api.post('/auth/register', data))
  const logout = async () => { await api.post('/auth/logout'); setUser(null) }

  return <AuthCtx.Provider value={{ user, loading, login, register, logout }}>{children}</AuthCtx.Provider>
}
