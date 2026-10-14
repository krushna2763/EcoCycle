import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  AlertCircle,
  Eye,
  MapPin,
  MoreVertical,
  PlusCircle,
  Recycle,
  Tag,
  Trash2,
} from 'lucide-react'
import api, { assetUrl } from '../../services/api'
import { formatDate } from '../../lib/format'
import Pagination from '../../components/common/Pagination'
import { useApi } from '../../hooks/useApi'

const PAGE_SIZE = 10

const CARD_COLORS = [
  { color: 'from-blue-400 to-cyan-300', emoji: '🧴' },
  { color: 'from-amber-300 to-orange-300', emoji: '🫙' },
  { color: 'from-emerald-400 to-teal-300', emoji: '♻️' },
  { color: 'from-rose-400 to-pink-300', emoji: '🥤' },
  { color: 'from-violet-400 to-purple-300', emoji: '📦' },
]

const STATUS_STYLES = {
  approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  rejected: 'bg-red-50 text-red-600 border border-red-200',
  sold_out: 'bg-slate-50 text-slate-600 border border-slate-200',
}

const STATUS_LABELS = {
  approved: 'Approved',
  pending: 'Pending Approval',
  rejected: 'Rejected',
  sold_out: 'Sold Out',
}

const FILTER_TABS = [
  { label: 'All', key: 'all' },
  { label: 'Approved', key: 'approved' },
  { label: 'Pending', key: 'pending' },
  { label: 'Rejected', key: 'rejected' },
  { label: 'Sold Out', key: 'sold_out' },
]

const SORTS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
]

const displayStatus = (listing) => (listing.status === 'approved' && listing.quantity <= 0 ? 'sold_out' : listing.status)

function ListingCard({ listing, index, onDelete, deleting }) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const statusKey = displayStatus(listing)
  const { color, emoji } = CARD_COLORS[index % CARD_COLORS.length]
  const cover = assetUrl(listing.image)
  const gallery = (listing.images || []).map(assetUrl).filter(Boolean)

  useEffect(() => {
    if (!menuOpen) return undefined
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpen])

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col sm:flex-row">
        {/* Image area */}
        <div className={`relative flex h-64 shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br ${color} sm:h-auto sm:w-72`}>
          {cover ? (
            <img src={cover} alt={listing.title} className="h-full w-full object-cover" />
          ) : (
            <span className="text-6xl">{emoji}</span>
          )}
          <span className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm">
            {listing.plasticType}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5">
          {/* Top row: title + status + menu */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-900">{listing.title}</h3>
            <div className="flex items-center gap-2">
              <span className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[statusKey] || STATUS_STYLES.pending}`}>
                {STATUS_LABELS[statusKey] || statusKey}
              </span>
              <div ref={menuRef} className="relative">
                <button
                  aria-label="Listing actions"
                  onClick={() => setMenuOpen((open) => !open)}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
                    <button
                      onClick={() => { setMenuOpen(false); onDelete(listing) }}
                      disabled={deleting}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete listing
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info row with separators */}
          <div className="mt-3 flex flex-wrap items-center text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Recycle className="h-3.5 w-3.5 text-brand-500" />
              {listing.plasticType}
            </span>
            <span className="mx-3 text-slate-300">|</span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              {listing.quantity} kg available
            </span>
            <span className="mx-3 text-slate-300">|</span>
            <span className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-slate-400" />
              ₹{listing.pricePerKg} / kg
            </span>
          </div>

          {/* Location */}
          <p className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            {listing.location}
          </p>

          {/* Description */}
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{listing.description}</p>

          {listing.openRequestCount > 0 && (
            <p className="mt-2 text-xs font-semibold text-brand-700">
              {listing.openRequestCount} open request{listing.openRequestCount > 1 ? 's' : ''}
            </p>
          )}

          {/* Bottom row: date, views, buttons */}
          <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                {formatDate(listing.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {listing.viewCount || 0} views
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpanded((open) => !open)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-700"
              >
                {expanded ? 'Hide Details' : 'View Details'}
              </button>
              <button
                onClick={() => navigate({ to: '/seller/dashboard/add-listing', search: { edit: listing._id } })}
                className="rounded-xl bg-brand-deep px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-deeper"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Detail label="Condition" value={listing.condition} />
            <Detail label="Collection Type" value={listing.collectionType} />
            <Detail label="Availability" value={listing.availability} />
            <Detail label="Unit" value={listing.unit} />
            <Detail label="Last Updated" value={formatDate(listing.updatedAt)} />
            <Detail label="Additional Info" value={listing.additionalInfo} />
          </div>
          {listing.status === 'pending' && (
            <p className="mt-3 text-xs text-amber-700">This listing is waiting for approval and is not visible to buyers yet.</p>
          )}
          {gallery.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {gallery.map((src) => (
                <img key={src} src={src} alt="" className="aspect-square w-full rounded-xl object-cover" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value || '—'}</span>
    </div>
  )
}

export default function MyListings() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const { data: result, loading, error, reload: load } = useApi(
    () => api.getListings({ status: activeFilter === 'all' ? undefined : activeFilter, sort: sortBy, page, limit: PAGE_SIZE }),
    [activeFilter, sortBy, page]
  )
  const data = result || { listings: [], counts: {}, pages: 1, total: 0 }

  const changeFilter = (key) => {
    setActiveFilter(key)
    setPage(1)
  }

  const handleDelete = async (listing) => {
    if (!window.confirm(`Delete "${listing.title}"? This cannot be undone.`)) return
    setDeletingId(listing._id)
    setActionError('')
    try {
      await api.deleteListing(listing._id)
      if (data.listings.length === 1 && page > 1) setPage(page - 1)
      else load()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/seller/dashboard" className="transition-colors hover:text-brand-600">Home</Link>
          <span className="text-slate-300">›</span>
          <span className="font-medium text-slate-700">My Listings</span>
        </nav>

        {/* Header */}
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">My Listings</h1>
            <p className="mt-1 text-sm text-slate-500">Manage all your plastic waste listings in one place.</p>
          </div>
          <Link
            to="/seller/dashboard/add-listing"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-deeper"
          >
            <PlusCircle className="h-4 w-4" />
            Add Plastic Waste
          </Link>
        </div>

        {/* Filter bar */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTER_TABS.map(({ label, key }) => {
              const isActive = activeFilter === key
              return (
                <button
                  key={key}
                  onClick={() => changeFilter(key)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'border border-brand-300 bg-brand-50 text-brand-700'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800'
                  }`}
                >
                  {label} ({data.counts?.[key] ?? 0})
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
              className="appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-brand-400"
            >
              {SORTS.map(({ label, value }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        </div>

        {actionError && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {actionError}
          </div>
        )}

        {/* Listing cards */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm font-medium text-red-600">{error}</p>
            <button onClick={load} className="mt-3 rounded-xl border border-red-300 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100">
              Try again
            </button>
          </div>
        ) : data.listings.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <Recycle className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">
              {activeFilter === 'all' ? 'You have not listed any plastic waste yet.' : 'No listings in this category.'}
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {data.listings.map((listing, idx) => (
              <ListingCard
                key={listing._id}
                listing={listing}
                index={idx}
                onDelete={handleDelete}
                deleting={deletingId === listing._id}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && <Pagination page={page} pages={data.pages} onChange={setPage} />}
      </div>
    </div>
  )
}
