import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import DashboardHero from '../../components/seller-dashboard/DashboardHero'
import DashboardStats from '../../components/seller-dashboard/DashboardStats'
import DashboardListings from '../../components/seller-dashboard/DashboardListings'
import DashboardRequests from '../../components/seller-dashboard/DashboardRequests'
import DashboardHelp from '../../components/seller-dashboard/DashboardHelp'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useApi } from '../../hooks/useApi'
import { announceRequestsChanged, useSocketEvent } from '../../hooks/useLiveUpdates'

const loadDashboard = async () => {
  const [stats, listings, requests] = await Promise.all([
    api.getDashboardStats(),
    api.getListings({ limit: 3 }),
    api.getRequests({ limit: 3 }),
  ])
  return { stats: stats.stats, listings: listings.listings, requests: requests.requests }
}

export default function SellerDashboard() {
  const { seller } = useAuth()
  const { data, loading, error, reload } = useApi(loadDashboard, [])
  const [actingId, setActingId] = useState(null)
  const [actionError, setActionError] = useState('')

  // Keep numbers current as buyers send, cancel or complete requests
  useSocketEvent('notification', reload)

  const act = async (requestId, action) => {
    setActingId(requestId)
    setActionError('')
    try {
      await action()
      announceRequestsChanged()
      reload()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setActingId(null)
    }
  }

  const handleAcceptRequest = (requestId) => act(requestId, () => api.acceptRequest(requestId))

  const handleRejectRequest = (requestId) => {
    const reason = window.prompt('Reason for declining (optional):')
    if (reason === null) return
    act(requestId, () => api.rejectRequest(requestId, reason.trim() || undefined))
  }

  if (loading && !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <DashboardHero sellerName={seller?.fullName} />
        {(error || actionError) && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {actionError || error}
            {error && <button onClick={reload} className="ml-auto font-semibold underline">Retry</button>}
          </div>
        )}
        {data && (
          <>
            <DashboardStats stats={data.stats} />
            <DashboardListings listings={data.listings} />
            <DashboardRequests
              requests={data.requests}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
              actingId={actingId}
            />
          </>
        )}
        <DashboardHelp />
      </div>
    </div>
  )
}
