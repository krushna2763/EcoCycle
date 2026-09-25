import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Package,
  Truck,
  Ban,
  FileText,
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const DEMO_REQUESTS = [
  {
    _id: 'demo-req1',
    listing: { title: 'PET Plastic Bottles', plasticType: 'PET' },
    seller: { fullName: 'Krushna Bhagawat', city: 'Pune' },
    interestedPlasticType: 'PET',
    quantity: 100,
    offerPrice: 30,
    location: 'Pune, Maharashtra',
    status: 'pending',
    message: 'Need regular weekly supply.',
    createdAt: '2026-09-20T10:30:00Z',
  },
  {
    _id: 'demo-req2',
    listing: { title: 'HDPE Containers', plasticType: 'HDPE' },
    seller: { fullName: 'Eco Collectors', city: 'Pimpri' },
    interestedPlasticType: 'HDPE',
    quantity: 25,
    offerPrice: 25,
    location: 'Pimpri, Maharashtra',
    status: 'accepted',
    createdAt: '2026-09-18T14:00:00Z',
  },
  {
    _id: 'demo-req3',
    listing: { title: 'Mixed Plastic Waste', plasticType: 'Mixed' },
    seller: { fullName: 'Green Roots', city: 'Pune' },
    interestedPlasticType: 'Mixed',
    quantity: 30,
    offerPrice: 20,
    location: 'Pune, Maharashtra',
    status: 'completed',
    createdAt: '2026-09-10T09:00:00Z',
  },
]

const TABS = ['All', 'Pending', 'Accepted', 'Scheduled', 'Completed', 'Cancelled']

const STATUS_CONFIG = {
  pending: { color: 'bg-amber-50 text-amber-600 border border-amber-200', icon: Clock, label: 'Pending' },
  accepted: { color: 'bg-emerald-50 text-emerald-600 border border-emerald-200', icon: CheckCircle2, label: 'Accepted' },
  scheduled: { color: 'bg-blue-50 text-blue-600 border border-blue-200', icon: Truck, label: 'Scheduled' },
  in_progress: { color: 'bg-indigo-50 text-indigo-600 border border-indigo-200', icon: Truck, label: 'In Progress' },
  completed: { color: 'bg-teal-50 text-teal-600 border border-teal-200', icon: CheckCircle2, label: 'Completed' },
  rejected: { color: 'bg-red-50 text-red-500 border border-red-200', icon: XCircle, label: 'Rejected' },
  cancelled: { color: 'bg-slate-100 text-slate-500 border border-slate-200', icon: Ban, label: 'Cancelled' },
}

export default function MyRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem('sellerToken')
      try {
        const headers = token ? { Authorization: 'Bearer ' + token } : {}
        const res = await fetch(`${API_BASE}/buyer/requests`, { headers })
        if (res.ok) {
          const data = await res.json()
          setRequests(data.requests || [])
        } else {
          setRequests(DEMO_REQUESTS)
        }
      } catch {
        setRequests(DEMO_REQUESTS)
      } finally {
        setLoading(false)
      }
    }
    fetchRequests()
  }, [])

  const handleCancel = async (id) => {
    const reason = window.prompt('Reason for cancellation (optional):')
    if (reason === null) return
    const token = localStorage.getItem('sellerToken')
    setActionError('')
    try {
      const res = await fetch(`${API_BASE}/buyer/requests/${id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: 'Bearer ' + token }),
        },
        body: JSON.stringify({ reason }),
      })
      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status: 'cancelled', cancellationReason: reason } : r))
        )
      } else {
        const data = await res.json()
        setActionError(data.message || 'Failed to cancel request')
      }
    } catch {
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: 'cancelled', cancellationReason: reason } : r))
      )
    }
  }

  const handleComplete = async (id) => {
    const token = localStorage.getItem('sellerToken')
    setActionError('')
    try {
      const res = await fetch(`${API_BASE}/buyer/requests/${id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: 'Bearer ' + token }),
        },
      })
      if (res.ok) {
        setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status: 'completed' } : r)))
      } else {
        const data = await res.json()
        setActionError(data.message || 'Failed to complete collection')
      }
    } catch {
      setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status: 'completed' } : r)))
    }
  }

  const filtered = requests.filter((r) => {
    if (activeTab === 'All') return true
    return r.status.toLowerCase() === activeTab.toLowerCase()
  })

  const countFor = (tab) =>
    tab === 'All' ? requests.length : requests.filter((r) => r.status.toLowerCase() === tab.toLowerCase()).length

  return (
    <div className="min-h-full bg-[#f8faf8] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">My Requests</h1>
            <p className="mt-1 text-sm text-slate-500">Track and manage all your buy requests in one place.</p>
          </div>
          <Link
            to="/buyer/dashboard/listings"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <FileText className="h-4 w-4" /> Browse More Listings
          </Link>
        </div>

        {actionError && (
          <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600">{actionError}</div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'border border-blue-300 bg-blue-50 text-blue-700'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {tab} ({countFor(tab)})
            </button>
          ))}
        </div>

        {/* Requests list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Package className="h-12 w-12 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-600">No requests found</p>
            <p className="mt-1 text-xs text-slate-400">Browse listings and send your first buy request.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((req) => {
              const st = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending
              const StatusIcon = st.icon
              return (
                <div key={req._id} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900">
                          {req.listing?.title || req.interestedPlasticType}
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {req.location}
                          </span>
                          <span>{req.quantity} kg</span>
                          {req.offerPrice && <span>₹{req.offerPrice}/kg</span>}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Seller: {req.seller?.fullName || 'Verified Seller'} •{' '}
                          {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${st.color}`}
                    >
                      <StatusIcon className="h-3 w-3" /> {st.label}
                    </span>
                  </div>

                  {req.status === 'cancelled' && req.cancellationReason && (
                    <div className="mx-5 mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                      <span className="font-semibold">Cancellation reason:</span> {req.cancellationReason}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-4">
                    {req.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(req._id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                      >
                        <Ban className="h-3.5 w-3.5" /> Cancel Request
                      </button>
                    )}
                    {(req.status === 'accepted' || req.status === 'scheduled' || req.status === 'in_progress') && (
                      <>
                        <button
                          onClick={() => handleCancel(req._id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                        >
                          <Ban className="h-3.5 w-3.5" /> Cancel
                        </button>
                        <button
                          onClick={() => handleComplete(req._id)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Mark as Collected
                        </button>
                      </>
                    )}
                    {req.status === 'completed' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Collection completed
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}