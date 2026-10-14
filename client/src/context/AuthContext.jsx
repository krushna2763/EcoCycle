import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import { closeSocket, reconnectSocket } from '../services/socket'

const AuthContext = createContext(null)

const readSavedUser = () => {
  try {
    return JSON.parse(localStorage.getItem('sellerData') || 'null')
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [seller, setSeller] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('sellerToken'))
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('sellerToken')))

  const saveSession = useCallback((newToken, user) => {
    localStorage.setItem('sellerToken', newToken)
    localStorage.setItem('sellerData', JSON.stringify(user))
    setToken(newToken)
    setSeller(user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('sellerToken')
    localStorage.removeItem('sellerData')
    closeSocket()
    setToken(null)
    setSeller(null)
  }, [])

  // Verify the stored token on startup
  useEffect(() => {
    if (!token) return
    let cancelled = false
    api.getMe()
      .then((data) => {
        if (cancelled) return
        setSeller(data.seller)
        localStorage.setItem('sellerData', JSON.stringify(data.seller))
      })
      .catch((error) => {
        if (cancelled) return
        if (error.status === 401) logout()
        // Server unreachable: keep the cached profile so the dashboard can show its own errors
        else setSeller(readSavedUser())
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
    // Only on startup; later token changes come from login/register/refreshToken
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Any API call rejected with 401 ends the session (expired or revoked token)
  useEffect(() => {
    window.addEventListener('auth:unauthorized', logout)
    return () => window.removeEventListener('auth:unauthorized', logout)
  }, [logout])

  const login = async (email, password) => {
    const data = await api.login(email, password)
    saveSession(data.token, data.seller)
    return data
  }

  const register = async (formData) => {
    const data = await api.register(formData)
    saveSession(data.token, data.seller)
    return data
  }

  // Store a replacement token (issued after a password change) and resume real-time updates
  const refreshToken = (newToken) => {
    localStorage.setItem('sellerToken', newToken)
    setToken(newToken)
    reconnectSocket()
  }

  const updateSeller = (updates) => {
    setSeller((current) => {
      const updated = { ...current, ...updates }
      localStorage.setItem('sellerData', JSON.stringify(updated))
      return updated
    })
  }

  const isBuyer = seller?.role === 'buyer'
  const isSeller = !seller?.role || seller?.role === 'seller'

  return (
    <AuthContext.Provider
      value={{
        seller,
        token,
        loading,
        isAuthenticated: !!token && !!seller,
        isBuyer,
        isSeller,
        login,
        register,
        logout,
        refreshToken,
        updateSeller,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
