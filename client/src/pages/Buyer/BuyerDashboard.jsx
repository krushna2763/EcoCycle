import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Store, FileText, Truck, Recycle, TrendingUp, MapPin, Sparkles, ShoppingBag } from 'lucide-react'
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
export default function BuyerDashboard() {
  const [buyer] = useState(() => {
    try {
      const saved = localStorage.getItem('sellerData')
      return saved ? JSON.parse(saved) : { fullName: 'Buyer Partner' }
    } catch {
      return { fullName: 'Buyer Partner' }
    }
  })
  const [stats, setStats] = useState({ totalRequests: 0, pendingRequests: 0, acceptedRequests: 0, scheduledRequests: 0, activeCollections: 0, completedRequests: 0, totalMaterialsProcured: 0, availableMarketplaceListings: 0 })
  const [recentListings, setRecentListings] = useState([])
  const [recentRequests, setRecentRequests] = useState([])
  useEffect(() => {
    const token = localStorage.getItem('sellerToken')
    const fetchData = async () => {
      try {
        const headers = token ? { Authorization: 'Bearer ' + token } : {}
        const [statsRes, listingsRes, requestsRes] = await Promise.all([
          fetch(API_BASE + '/buyer/dashboard/stats', { headers }),
          fetch(API_BASE + '/buyer/listings?limit=4', { headers }),
          fetch(API_BASE + '/buyer/requests', { headers }),
        ])
        if (statsRes.ok) { const d = await statsRes.json(); setStats(d.stats) }
        if (listingsRes.ok) { const d = await listingsRes.json(); setRecentListings(d.listings.slice(0, 4)) }
        if (requestsRes.ok) { const d = await requestsRes.json(); setRecentRequests(d.requests.slice(0, 3)) }
      } catch {
        setStats({ totalRequests: 5, pendingRequests: 2, acceptedRequests: 1, scheduledRequests: 1, activeCollections: 2, completedRequests: 1, totalMaterialsProcured: 250, availableMarketplaceListings: 12 })
      }
    }
    fetchData()
  }, [])

  const statCards = [
    { label: 'Total Requests', value: stats.totalRequests, icon: FileText, color: 'text-blue-600 bg-blue-50' },
    { label: 'Pending Requests', value: stats.pendingRequests, icon: Truck, color: 'text-amber-600 bg-amber-50' },
    { label: 'Accepted Requests', value: stats.acceptedRequests, icon: Store, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Active Collections', value: stats.activeCollections, icon: Recycle, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Completed Orders', value: stats.completedRequests, icon: ShoppingBag, color: 'text-teal-600 bg-teal-50' },
    { label: 'Materials Procured (kg)', value: stats.totalMaterialsProcured, icon: TrendingUp, color: 'text-violet-600 bg-violet-50' },
    { label: 'Available Listings', value: stats.availableMarketplaceListings, icon: Sparkles, color: 'text-cyan-600 bg-cyan-50' },
    { label: 'Scheduled Pickups', value: stats.scheduledRequests, icon: MapPin, color: 'text-rose-600 bg-rose-50' },
  ]

  const quickActions = [
    { label: 'Browse Listings', path: '/buyer/dashboard/listings', icon: Store },
    { label: 'My Requests', path: '/buyer/dashboard/requests', icon: FileText },
    { label: 'Collections', path: '/buyer/dashboard/collections', icon: Truck },
  ]

  const statusBadge = (status) => {
    const map = {
      pending: 'bg-amber-50 text-amber-600 border border-amber-200',
      accepted: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
      scheduled: 'bg-blue-50 text-blue-600 border border-blue-200',
      in_progress: 'bg-indigo-50 text-indigo-600 border border-indigo-200',
      completed: 'bg-teal-50 text-teal-600 border border-teal-200',
      rejected: 'bg-red-50 text-red-500 border border-red-200',
      cancelled: 'bg-slate-100 text-slate-500 border border-slate-200',
    }
    return map[status] || map.pending
  }

  return (
    <div className="min-h-full bg-[#f8faf8] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Welcome back, {buyer?.fullName || 'Buyer Partner'} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Source verified plastic waste and track your procurement pipeline.
            </p>
          </div>
          <div className="flex gap-2">
            {quickActions.map(({ label, path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-700"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-2xl font-extrabold text-slate-900">{value}</p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent listings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Fresh Listings Near You</h2>
              <Link
                to="/buyer/dashboard/listings"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View all →
              </Link>
            </div>

            {recentListings.length === 0 ? (
              <p className="mt-6 text-sm text-slate-500">No listings available right now.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {recentListings.map((listing) => (
                  <Link
                    key={listing._id}
                    to="/buyer/dashboard/listings/$id"
                    params={{ id: listing._id }}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {listing.title || listing.plasticType}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" /> {listing.location}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-blue-700">₹{listing.pricePerKg}/kg</p>
                      <p className="text-[11px] text-slate-500">{listing.quantity} kg</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent requests */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Recent Requests</h2>
              <Link
                to="/buyer/dashboard/requests"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View all →
              </Link>
            </div>

            {recentRequests.length === 0 ? (
              <p className="mt-6 text-sm text-slate-500">
                You haven't sent any requests yet. Browse listings to get started.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {recentRequests.map((req) => (
                  <div
                    key={req._id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {req.listing?.title || req.interestedPlasticType}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {req.quantity} kg • {req.location}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize ${statusBadge(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
