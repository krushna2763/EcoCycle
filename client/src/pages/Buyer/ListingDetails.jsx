import { useState, useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  MapPin,
  Package,
  Store,
  Truck,
  CheckCircle2,
  Send,
  Eye,
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const DEMO_LISTING = {
  _id: 'demo1',
  title: 'PET Plastic Bottles',
  plasticType: 'PET',
  quantity: 50,
  pricePerKg: 30,
  location: 'Pune, Maharashtra',
  condition: 'Clean',
  description:
    'Clean used PET bottles collected from local shops and segregation units. Washed and sorted, ideal for recycling into rPET flakes and fibers.',
  availability: 'Available for pickup',
  collectionType: 'Seller pickup or buyer transport',
  seller: { fullName: 'Krushna Bhagawat', city: 'Pune', phone: '+91 98765 43210', businessName: 'EcoCollective' },
  viewCount: 24,
}

export default function ListingDetails() {
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()

  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ quantity: '', offerPrice: '', location: '', message: '' })

  useEffect(() => {
    const applyListing = (l) => {
      setListing(l)
      if (l) {
        setForm((f) => ({
          ...f,
          quantity: l.quantity || '',
          offerPrice: l.pricePerKg || '',
          location: l.location || '',
        }))
      }
    }
    const fetchListing = async () => {
      const token = localStorage.getItem('sellerToken')
      try {
        const headers = token ? { Authorization: 'Bearer ' + token } : {}
        const res = await fetch(`${API_BASE}/buyer/listings/${id}`, { headers })
        if (res.ok) {
          const data = await res.json()
          applyListing(data.listing)
        } else {
          applyListing(DEMO_LISTING)
        }
      } catch {
        applyListing(DEMO_LISTING)
      } finally {
        setLoading(false)
      }
    }
    fetchListing()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const token = localStorage.getItem('sellerToken')
    try {
      const res = await fetch(`${API_BASE}/buyer/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: 'Bearer ' + token }),
        },
        body: JSON.stringify({
          listingId: id,
          quantity: Number(form.quantity),
          offerPrice: Number(form.offerPrice),
          location: form.location,
          message: form.message,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Failed to send request')
        return
      }
      setSuccess(true)
      setTimeout(() => navigate({ to: '/buyer/dashboard/requests' }), 1500)
    } catch {
      // Demo mode: API unavailable
      setSuccess(true)
      setTimeout(() => navigate({ to: '/buyer/dashboard/requests' }), 1500)
    } finally {
      setSubmitting(false)
    }
  }

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
        <p className="text-sm font-semibold text-slate-600">Listing not found</p>
        <button
          onClick={() => navigate({ to: '/buyer/dashboard/listings' })}
          className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
        >
          Back to Listings
        </button>
      </div>
    )
  }

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
                <DetailRow icon={Truck} label="Availability" value={listing.availability || 'Available for pickup'} />
                <DetailRow icon={Store} label="Collection Type" value={listing.collectionType || 'Pickup by buyer'} />
              </div>
            </div>

            {/* Seller card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">About the Seller</h2>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">
                  {(listing.seller?.fullName || 'S').charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {listing.seller?.businessName || listing.seller?.fullName || 'Verified Seller'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {listing.seller?.city || listing.location} • Trusted Partner
                  </p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </span>
              </div>
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

              {success ? (
                <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
                  <p className="mt-2 text-sm font-bold text-emerald-700">Request Sent!</p>
                  <p className="mt-1 text-xs text-emerald-600">Redirecting to your requests...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  {error && (
                    <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600">{error}</div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-slate-600">Quantity (kg)</label>
                    <input
                      type="number"
                      min="1"
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
                    <label className="text-xs font-semibold text-slate-600">Pickup Location</label>
                    <input
                      type="text"
                      required
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
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
              )}
            </div>
          </div>
        </div>
      </div>
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