import { Navigate } from '@tanstack/react-router'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, loading, seller } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && seller?.role && seller.role !== requiredRole) {
    // If buyer attempts to access seller dashboard, redirect to buyer dashboard
    if (seller.role === 'buyer') {
      return <Navigate to="/buyer/dashboard" replace />
    }
    // If seller attempts to access buyer dashboard, redirect to seller dashboard
    return <Navigate to="/seller/dashboard" replace />
  }

  return children
}
