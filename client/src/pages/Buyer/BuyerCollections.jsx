import { useState, useEffect } from 'react'
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Truck,
  HeadphonesIcon,
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const DEMO_COLLECTIONS = [
  {
    _id: 'demo-col1',
    listing: { title: 'PET Plastic Bottles', plasticType: 'PET' },
    seller: { fullName: 'Krushna Bhagawat', city: 'Pune' },
    quantity: 100,
    offerPrice: 30,
    location: 'Pune, Maharashtra',
    status: 'scheduled',
    scheduledDate: '24 Aug 2026',
    scheduledTime: '11:00 AM',
    scheduledLocation: 'Wakad, Pune',
    createdAt: '2026-09-18T14:00:00Z',
  },
  {
    _id: 'demo-col2',
    listing: { title: 'HDPE Containers', plasticType: 'HDPE' },
    seller: { fullName: 'Eco Collectors', city: 'Pimpri' },
    quantity: 25,
    offerPrice: 25,
    location: 'Pimpri, Maharashtra',
    status: 'in_progress',
    scheduledDate: '20 Aug 2026',
    scheduledTime: '02:00 PM',
    scheduledLocation: 'Pimpri, Pune',
    createdAt: '2026-09-15T09:00:00Z',
  },
  {
    _id: 'demo-col3',
    listing: { title: 'Mixed Plastic Waste', plasticType: 'Mixed' },
    seller: { fullName: 'Green Roots', city: 'Pune' },
    quantity: 30,
    offerPrice: 20,
    location: 'Pune, Maharashtra',
    status: 'completed',
    scheduledDate: '10 Aug 2026',
    scheduledTime: '09:45 AM',
    scheduledLocation: 'Viman Nagar, Pune',
    createdAt: '2026-09-05T11:00:00Z',
  },
]

const STATUS_CONFIG = {
  accepted: { color: 'bg-emerald-50 text-emerald-600 border border-emerald-200', icon: CheckCircle2, label: 'Accepted' },
  scheduled: { color: 'bg-blue-50 text-blue-600 border border-blue-200', icon: Calendar, label: 'Scheduled' },
  in_progress: { color: 'bg-indigo-50 text-indigo-600 border border-indigo-200', icon: Truck, label: 'In Progress' },
  completed: { color: 'bg-teal-50 text-teal-600 border border-teal-200', icon: CheckCircle2, label: 'Completed' },
}

const ACTIVE_STATUSES = ['accepted', 'scheduled', 'in_progress', 'completed']

export default function BuyerCollections() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCollections = async () => {
      const token = localStorage.getItem('sellerToken')
      try {
        const headers = token ? { Authorization: 'Bearer ' + token } : {}
        const res = await fetch(`${API_BASE}/buyer/requests`, { headers })
        if (res.ok) {
          const data = await res.json()
          const active = (data.requests || []).filter((r) => ACTIVE_STATUSES.includes(r.status))
          setCollections(active)
        } else {
          setCollections(DEMO_COLLECTIONS)
        }
      } catch {
        setCollections(DEMO_COLLECTIONS)
      } finally {
        setLoading(false)
      }
    }
    fetchCollections()
  }, [])

  const handleComplete = async (id) => {
    const token = localStorage.getItem('sellerToken')
    setError('')
    try {
      const res = await fetch(`${API_BASE}/buyer/requests/${id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: 'Bearer ' + token }),
        },
      })
      if (res.ok) {
        setCollections((prev) => prev.map((c) => (c._id === id ? { ...c, status: 'completed' } : c)))
      } else {
        const data = await res.json()
        setError(data.message || 'Failed to confirm collection')
      }
    } catch {
      setCollections((prev) => prev.map((c) => (c._id === id ? { ...c, status: 'completed' } : c)))
    }
  }

  return (
    <div className="min-h-full bg-[#f8faf8] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">My Collections</h1>
          <p className="mt-1 text-sm text-slate-500">
            Scheduled pickups and completed procurement collections.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600">{error}</div>
        )}

        {/* Collections list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Truck className="h-12 w-12 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-600">No active collections</p>
            <p className="mt-1 text-xs text-slate-400">
              Accepted requests with scheduled pickups will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {collections.map((col) => {
              const st = STATUS_CONFIG[col.status] || STATUS_CONFIG.accepted
              const StatusIcon = st.icon
              return (
                <div key={col._id} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900">
                          {col.listing?.title || col.interestedPlasticType}
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {col.scheduledLocation || col.location}
                          </span>
                          <span>{col.quantity} kg</span>
                          {col.offerPrice && <span>₹{col.offerPrice}/kg</span>}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Seller: {col.seller?.fullName || 'Verified Seller'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${st.color}`}
                    >
                      <StatusIcon className="h-3 w-3" /> {st.label}
                    </span>
                  </div>

                  {(col.scheduledDate || col.status === 'completed') && (
                    <div className="mx-5 mb-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      <div>
                        <p className="text-xs font-bold text-blue-700">
                          {col.status === 'completed' ? 'Collection Completed' : 'Pickup Scheduled'}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-600">
                          {[col.scheduledDate, col.scheduledTime].filter(Boolean).join(' • ') || 'Completed'}
                          {col.scheduledLocation && ` at ${col.scheduledLocation}`}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-4">
                    {col.status !== 'completed' ? (
                      <button
                        onClick={() => handleComplete(col._id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Confirm Receipt
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Confirmed
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Support */}
        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <HeadphonesIcon className="h-6 w-6 text-blue-600" strokeWidth={1.8} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Need help with a collection?</h3>
              <p className="mt-0.5 text-xs text-slate-500">Our support team is here to assist you.</p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
            <HeadphonesIcon className="h-4 w-4" />
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}