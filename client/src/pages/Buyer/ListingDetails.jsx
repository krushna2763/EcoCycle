import { useState } from 'react'
import { Link, useParams, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  MapPin,
  Package,
  Store,
  Truck,
  CheckCircle2,
  Send,
  Eye,
  FileText,
} from 'lucide-react'
import api, { assetUrl } from '../../services/api'
import { useApi } from '../../hooks/useApi'
import { statusLabel } from '../../lib/format'

export default function ListingDetails() {
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()
  const { data, loading, error } = useApi(() => api.getMarketplaceListing(id), [id])
  const listing = data?.listing
  const activeRequest = data?.activeRequest

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#f8faf8] py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-[#f8faf8] py-20">
        <p className="text-sm font-semibold text-slate-600">
          {error === 'Listing not found' || !error ? 'This listing is no longer available' : error}
        </p>
        <button
          onClick={() => navigate({ to: '/buyer/dashboard/listings' })}
          className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
        >
          Back to Listings
        </button>
      </div>
    )
  }

  const sellerName = listing.seller?.businessName || listing.seller?.fullName || 'EcoCycle Seller'
  const photos = [...(listing.images || []), listing.image].map(assetUrl).filter(Boolean)
  const gallery = [...new Set(photos)]

  return (
    <div className="min-h-full bg-[#f8faf8] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Back button */}
        <button
          onClick={() => navigate({ to: '/buyer/dashboard/listings' })}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Listings
        </button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: listing details */}
          <div className="space-y-6 lg:col-span-2">
            {gallery.length > 0 && <Gallery photos={gallery} title={listing.title} />}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                    <Package className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{listing.title}</h1>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                        {listing.plasticType}
                      </span>
                      {listing.condition && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                          {listing.condition}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Eye className="h-3 w-3" /> {listing.viewCount || 0} views
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-600">{listing.description}</p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <DetailRow icon={MapPin} label="Location" value={listing.location} />
                <DetailRow icon={Package} label="Quantity Available" value={`${listing.quantity} kg`} />
                <DetailRow icon={Truck} label="Availability" value={listing.availability || 'Not specified'} />
                <DetailRow icon={Store} label="Collection Type" value={listing.collectionType || 'Not specified'} />
              </div>
              {listing.additionalInfo && (
                <p className="mt-4 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 text-xs text-slate-600">
                  {listing.additionalInfo}
                </p>
              )}
            </div>

            {/* Seller card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">About the Seller</h2>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">
                  {sellerName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{sellerName}</p>
                  <p className="text-xs text-slate-500">
                    {listing.seller?.city || listing.location}
                  </p>
                </div>
                {listing.seller?.verificationStatus === 'verified' && (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
              {!listing.seller?.fullName && (
                <p className="mt-3 text-xs text-slate-400">This seller keeps their profile private until they accept a request.</p>
              )}
            </div>
          </div>

          {/* Right: request form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-extrabold text-blue-700">
                  ₹{listing.pricePerKg}
                  <span className="text-sm font-semibold text-slate-500"> / kg</span>
                </p>
                <p className="text-xs text-slate-400">{listing.quantity} kg max</p>
              </div>

              {activeRequest ? (
                <div className="mt-5 rounded-xl bg-blue-50 p-4 text-center">
                  <FileText className="mx-auto h-8 w-8 text-blue-600" />
                  <p className="mt-2 text-sm font-bold text-blue-700">
                    You already have a {statusLabel(activeRequest.status).toLowerCase()} request
                  </p>
                  <p className="mt-1 text-xs text-blue-600">For {activeRequest.quantity} kg of this listing.</p>
                  <Link
                    to="/buyer/dashboard/requests"
                    className="mt-3 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    View My Requests
                  </Link>
                </div>
              ) : (
                <RequestForm listing={listing} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RequestForm({ listing }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    quantity: String(listing.quantity || ''),
    offerPrice: String(listing.pricePerKg || ''),
    location: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    const quantity = Number(form.quantity)
    const offerPrice = Number(form.offerPrice)
    if (!(quantity > 0) || quantity > listing.quantity) {
      setError(`Enter a quantity between 1 and ${listing.quantity} kg`)
      return
    }
    if (!(offerPrice > 0)) {
      setError('Enter an offer price greater than 0')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await api.createBuyRequest({
        listingId: listing._id,
        quantity,
        offerPrice,
        location: form.location.trim() || undefined,
        message: form.message.trim() || undefined,
      })
      setSuccess(true)
      setTimeout(() => navigate({ to: '/buyer/dashboard/requests' }), 1500)
    } catch (err) {
      setError(err.message || 'Failed to send request')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
        <p className="mt-2 text-sm font-bold text-emerald-700">Request Sent!</p>
        <p className="mt-1 text-xs text-emerald-600">Redirecting to your requests...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600">{error}</div>
      )}

      <div>
        <label className="text-xs font-semibold text-slate-600">Quantity (kg)</label>
        <input
          type="number"
          min="1"
          max={listing.quantity}
          required
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-600">Offer Price (₹/kg)</label>
        <input
          type="number"
          min="1"
          required
          value={form.offerPrice}
          onChange={(e) => setForm({ ...form, offerPrice: e.target.value })}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-600">Your Location</label>
        <input
          type="text"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="Defaults to your profile city"
          maxLength={200}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-600">Message (optional)</label>
        <textarea
          rows="3"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Tell the seller about your requirements..."
          maxLength={1000}
          className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {submitting ? 'Sending...' : 'Send Buy Request'}
      </button>
    </form>
  )
}

function Gallery({ photos, title }) {
  const [active, setActive] = useState(0)
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <img src={photos[active]} alt={title} className="h-72 w-full object-cover" />
      {photos.length > 1 && (
        <div className="flex gap-2 p-3">
          {photos.map((src, idx) => (
            <button
              key={src}
              onClick={() => setActive(idx)}
              aria-label={`Show photo ${idx + 1}`}
              className={`h-14 w-14 overflow-hidden rounded-lg border-2 ${idx === active ? 'border-blue-500' : 'border-transparent'}`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
        <Icon className="h-4 w-4 text-blue-600" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  )
}
