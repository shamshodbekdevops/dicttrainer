import { createContext, useContext, useMemo, useState } from 'react'

import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('vt_access_token') || '')
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('vt_refresh_token') || '')
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('vt_user')
    return raw ? JSON.parse(raw) : null
  })

  const persistAuth = (payload) => {
    localStorage.setItem('vt_access_token', payload.access)
    localStorage.setItem('vt_refresh_token', payload.refresh)
    localStorage.setItem('vt_user', JSON.stringify(payload.user))
    setAccessToken(payload.access)
    setRefreshToken(payload.refresh)
    setUser(payload.user)
  }

  const clearAuth = () => {
    localStorage.removeItem('vt_access_token')
    localStorage.removeItem('vt_refresh_token')
    localStorage.removeItem('vt_user')
    setAccessToken('')
    setRefreshToken('')
    setUser(null)
  }

  const register = async (data) => {
    const response = await api.post('/auth/register', data)
    persistAuth(response.data)
  }

  const login = async (data) => {
    const response = await api.post('/auth/login', data)
    persistAuth(response.data)
  }

  const logout = async () => {
    const refresh = localStorage.getItem('vt_refresh_token')
    try {
      if (refresh) {
        await api.post('/auth/logout', { refresh })
      }
    } catch (_e) {
      // Best effort logout; local token cleanup still applies.
    }
    clearAuth()
  }

  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: Boolean(accessToken),
      register,
      login,
      logout,
    }),
    [user, accessToken, refreshToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
