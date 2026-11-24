import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  Users,
  Store,
  Building2,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  GitPullRequestArrow,
  Recycle,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
} from 'lucide-react'
import api from '../../services/api'
import { formatNumber } from '../../lib/format'

export default function AdminDashboard() {
  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => api.getAdminStats(),
  })

  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['adminPendingListings', { limit: 5 }],
    queryFn: () => api.getPendingListings({ limit: 5 }),
  })

  const stats = statsData?.stats || {}
  const pendingListings = pendingData?.listings || []

  const STAT_CARDS = [
    {
      title: 'Total Users',
      value: formatNumber(stats.totalUsers || 0),
      subtitle: `${stats.totalSellers || 0} Sellers • ${stats.totalBuyers || 0} Buyers`,
      icon: Users,
      bg: 'bg-indigo-50',
      color: 'text-indigo-600',
      to: '/admin/dashboard/users',
    },
    {
      title: 'Pending Reviews',
      value: formatNumber(stats.pendingListings || 0),
      subtitle: 'Listings awaiting moderation',
      icon: Clock,
      bg: 'bg-amber-50',
      color: 'text-amber-600',
      badge: stats.pendingListings > 0 ? 'Action Required' : null,
      to: '/admin/dashboard/listings',
    },
    {
      title: 'Approved Listings',
      value: formatNumber(stats.approvedListings || 0),
      subtitle: `Out of ${stats.totalListings || 0} total listings`,
      icon: CheckCircle2,
      bg: 'bg-emerald-50',
      color: 'text-emerald-600',
    },
    {
      title: 'Rejected Listings',
      value: formatNumber(stats.rejectedListings || 0),
      subtitle: 'Awaiting seller resubmission',
      icon: XCircle,
      bg: 'bg-rose-50',
      color: 'text-rose-600',
    },
    {
      title: 'Purchase Requests',
      value: formatNumber(stats.totalRequests || 0),
      subtitle: `${stats.completedRequests || 0} completed`,
      icon: GitPullRequestArrow,
      bg: 'bg-blue-50',
      color: 'text-blue-600',
    },
    {
      title: 'Total Recycled',
      value: `${formatNumber(stats.totalRecycledKg || 0)} kg`,
      subtitle: `${stats.completedCollections || 0} successful pickups`,
      icon: Recycle,
      bg: 'bg-teal-50',
      color: 'text-teal-600',
    },
  ]

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-800 to-brand-800 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-200">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">EcoCycle Administration</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Platform Overview</h1>
            <p className="mt-1 text-sm text-emerald-100/90">
              Review new listings, monitor trade activity, and manage platform compliance.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/dashboard/listings"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
            >
              <Clock className="h-4 w-4" />
              Review Listings ({stats.pendingListings || 0})
            </Link>
            <Link
              to="/admin/dashboard/users"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700/60 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-emerald-700"
            >
              <Users className="h-4 w-4" />
              View Users
            </Link>
          </div>
        </div>
      </div>

      {statsError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>Failed to load platform statistics: {statsError.message}</span>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon
          const CardContent = (
            <div className="group relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-slate-200 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} strokeWidth={2} />
                </span>
                {card.badge && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                    {card.badge}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{card.title}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  {statsLoading ? (
                    <span className="inline-block h-8 w-20 animate-pulse rounded bg-slate-200" />
                  ) : (
                    card.value
                  )}
                </p>
                <p className="mt-1 text-xs text-slate-500">{card.subtitle}</p>
              </div>
            </div>
          )

          return card.to ? (
            <Link key={card.title} to={card.to} className="block">
              {CardContent}
            </Link>
          ) : (
            <div key={card.title}>{CardContent}</div>
          )
        })}
      </div>

      {/* Role Counts Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Store className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Waste Generators</p>
            <p className="text-xl font-bold text-slate-900">{stats.totalSellers || 0} Sellers</p>
          </div>
          <Link
            to="/admin/dashboard/users"
            search={{ role: 'seller' }}
            className="text-xs font-semibold text-brand-600 hover:underline"
          >
            Manage sellers →
          </Link>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Building2 className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Recyclers & Buyers</p>
            <p className="text-xl font-bold text-slate-900">{stats.totalBuyers || 0} Buyers</p>
          </div>
          <Link
            to="/admin/dashboard/users"
            search={{ role: 'buyer' }}
            className="text-xs font-semibold text-brand-600 hover:underline"
          >
            Manage buyers →
          </Link>
        </div>
      </div>

      {/* Recent Pending Listings Section */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Listings Awaiting Moderation</h2>
            <p className="text-xs text-slate-500">Verify material specifications, quality, and realistic pricing</p>
          </div>
          <Link
            to="/admin/dashboard/listings"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View all pending <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {pendingLoading ? (
          <div className="space-y-3 py-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : pendingListings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <p className="mt-2 text-sm font-semibold text-slate-800">All caught up!</p>
            <p className="text-xs text-slate-500">There are no listings currently awaiting review.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Seller</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingListings.map((listing) => (
                  <tr key={listing._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3.5 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                          <Package className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-semibold text-slate-800">{listing.title}</p>
                          <p className="text-xs text-slate-400">{listing.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      <p className="font-medium text-slate-800">{listing.seller?.fullName || 'Seller'}</p>
                      <p className="text-xs text-slate-400">{listing.seller?.city || '—'}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {listing.plasticType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">
                      {listing.quantity} {listing.unit || 'kg'}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">
                      ₹{listing.pricePerKg}/kg
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        to={`/admin/dashboard/listings/${listing._id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
