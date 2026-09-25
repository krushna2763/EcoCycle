import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export function AuthProvider({ children }) {
  const [seller, setSeller] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('sellerToken'))
  const [loading, setLoading] = useState(true)

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.ok) {
          const data = await res.json()
          setSeller(data.seller)
          localStorage.setItem('sellerData', JSON.stringify(data.seller))
        } else {
          // Token invalid, clear it
          localStorage.removeItem('sellerToken')
          localStorage.removeItem('sellerData')
          setToken(null)
          setSeller(null)
        }
      } catch {
        // API unavailable, use localStorage fallback
        const savedSeller = localStorage.getItem('sellerData')
        if (savedSeller) {
          try {
            setSeller(JSON.parse(savedSeller))
          } catch {
            setSeller(null)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [token])

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Login failed')
    }

    localStorage.setItem('sellerToken', data.token)
    localStorage.setItem('sellerData', JSON.stringify(data.seller))
    setToken(data.token)
    setSeller(data.seller)
    return data
  }

  const register = async (formData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Registration failed')
    }

    localStorage.setItem('sellerToken', data.token)
    localStorage.setItem('sellerData', JSON.stringify(data.seller))
    setToken(data.token)
    setSeller(data.seller)
    return data
  }

  const logout = () => {
    localStorage.removeItem('sellerToken')
    localStorage.removeItem('sellerData')
    setToken(null)
    setSeller(null)
  }

  const updateSeller = (updates) => {
    const updated = { ...seller, ...updates }
    setSeller(updated)
    localStorage.setItem('sellerData', JSON.stringify(updated))
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
        updateSeller,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
