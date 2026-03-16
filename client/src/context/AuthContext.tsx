import { createContext, useContext, useState, ReactNode } from 'react'
import type { User, AuthResponse, AuthContextValue } from '../types'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('locl_user') ?? 'null') }
    catch { return null }
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('locl_token'))

  function login(authData: AuthResponse) {
    const { token, role, name, userId } = authData
    setToken(token)
    const userObj: User = { role, name, userId }
    setUser(userObj)
    localStorage.setItem('locl_token', token)
    localStorage.setItem('locl_user', JSON.stringify(userObj))
  }

  function logout() {
    setToken(null)
    setUser(null)
    localStorage.removeItem('locl_token')
    localStorage.removeItem('locl_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
