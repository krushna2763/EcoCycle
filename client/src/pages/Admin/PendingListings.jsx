import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  ClipboardList,
  Eye,
  Package,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Building,
  User,
} from 'lucide-react'
import api, { assetUrl } from '../../services/api'
import { formatNumber } from '../../lib/format'

export default function PendingListings() {
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminPendingListings', { page, limit }],
    queryFn: () => api.getPendingListings({ page, limit }),
  })

  const listings = data?.listings || []
  const total = data?.total || 0
  const totalPages = data?.totalPages || 1

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600">
            <ClipboardList className="h-4 w-4" /> Moderation Queue
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Listings Waiting for Review
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Review specifications, verify quality claims, and approve or reject with constructive feedback.
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
          {total} Pending {total === 1 ? 'Listing' : 'Listings'}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>Error loading pending listings: {error.message}</span>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 w-full animate-pulse rounded-2xl bg-white border border-slate-100 p-6" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h3 className="mt-3 text-base font-semibold text-slate-800">Queue is Clear</h3>
          <p className="mt-1 text-sm text-slate-500">No listings are currently waiting for admin moderation.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {listings.map((listing) => {
              const coverUrl = assetUrl(listing.image || listing.images?.[0])
              return (
                <div
                  key={listing._id}
                  className="flex flex-col gap-4 p-5 transition hover:bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                >
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                      {coverUrl ? (
                        <img src={coverUrl} alt={listing.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                          Pending Review
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          {listing.plasticType}
                        </span>
                        <span className="text-xs text-slate-400">
                          ID: {listing._id.slice(-6)}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">{listing.title}</h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          {listing.seller?.sellerType === 'business' ? (
                            <Building className="h-3.5 w-3.5 text-slate-400" />
                          ) : (
                            <User className="h-3.5 w-3.5 text-slate-400" />
                          )}
                          <strong className="text-slate-700">{listing.seller?.fullName}</strong>
                          {listing.seller?.businessName && ` (${listing.seller.businessName})`}
                        </span>

                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {listing.location}
                        </span>

                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          Submitted {new Date(listing.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="pt-1 text-sm font-semibold text-slate-800">
                        Quantity: <span className="text-emerald-700">{listing.quantity} {listing.unit || 'kg'}</span>
                        <span className="mx-2 text-slate-300">•</span>
                        Price: <span className="text-emerald-700">₹{listing.pricePerKg}/kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0">
                    <Link
                      to={`/admin/dashboard/listings/${listing._id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                      <Eye className="h-4 w-4" />
                      Review Listing
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
              <p className="text-xs text-slate-500">
                Showing page <strong className="text-slate-700">{page}</strong> of <strong className="text-slate-700">{totalPages}</strong> ({total} total)
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50 hover:bg-slate-50"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50 hover:bg-slate-50"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
