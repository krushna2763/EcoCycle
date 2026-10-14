import { Link } from '@tanstack/react-router'
import { Package, MapPin, Eye, PlusCircle } from 'lucide-react'
import { assetUrl } from '../../services/api'
import { formatDate } from '../../lib/format'

const STATUS_STYLES = {
  approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  sold_out: 'bg-slate-50 text-slate-600 border border-slate-200',
}

const STATUS_LABELS = { approved: 'Approved', pending: 'Pending', rejected: 'Rejected', sold_out: 'Sold Out' }

const LISTING_GRADIENTS = [
  'from-blue-400 to-cyan-300',
  'from-amber-300 to-orange-300',
  'from-emerald-400 to-teal-300',
]

const LISTING_EMOJIS = ['🧴', '🫙', '♻️']

export default function DashboardListings({ listings }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">My Listings</h2>
        <Link to="/seller/dashboard/listings" className="flex items-center gap-1 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700">
          View All
          <span className="text-lg">→</span>
        </Link>
      </div>

      {listings.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
          <p className="text-sm text-slate-500">You have no listings yet.</p>
          <Link to="/seller/dashboard/add-listing" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800">
            <PlusCircle className="h-4 w-4" /> Add your first listing
          </Link>
        </div>
      )}

      {/* Listing cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing, idx) => {
          const statusKey = listing.status === 'approved' && listing.quantity <= 0 ? 'sold_out' : listing.status
          const cover = assetUrl(listing.image)
          return (
            <Link
              key={listing._id}
              to="/seller/dashboard/listings"
              className="group overflow-hidden rounded-2xl border border-slate-100 bg-white transition-shadow hover:shadow-md"
            >
              {/* Image */}
              <div className={`relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br ${LISTING_GRADIENTS[idx % LISTING_GRADIENTS.length]}`}>
                {cover ? (
                  <img src={cover} alt={listing.title} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl">{LISTING_EMOJIS[idx % LISTING_EMOJIS.length]}</span>
                )}
                <span
                  className={`absolute right-3 top-3 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[statusKey] || STATUS_STYLES.pending}`}
                >
                  {STATUS_LABELS[statusKey] || statusKey}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-sm font-bold text-slate-900">{listing.title}</h3>

                <div className="mt-3 grid grid-cols-2 gap-y-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-slate-400" />
                    {listing.quantity} kg
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm">₹</span>{listing.pricePerKg} / kg
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {listing.location}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    {formatDate(listing.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {listing.viewCount || 0}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
