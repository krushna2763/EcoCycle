import { useState } from 'react'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Package,
  MapPin,
  Calendar,
  Building,
  User,
  Phone,
  Mail,
  ShieldCheck,
  AlertCircle,
  Eye,
  FileText,
  AlertTriangle,
} from 'lucide-react'
import api, { assetUrl } from '../../services/api'

export default function ReviewListing() {
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [remarks, setRemarks] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  // Checklist state
  const [checklist, setChecklist] = useState({
    photosMatch: false,
    pricingRealistic: false,
    locationClear: false,
    detailsComplete: false,
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminListingReview', id],
    queryFn: () => api.getListingForReview(id),
    enabled: Boolean(id),
  })

  const listing = data?.listing

  const approveMutation = useMutation({
    mutationFn: () => api.approveListing(id),
    onSuccess: () => {
      setActionSuccess('Listing approved successfully! It is now live on the marketplace.')
      queryClient.invalidateQueries({ queryKey: ['adminPendingListings'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      setTimeout(() => {
        navigate({ to: '/admin/dashboard/listings' })
      }, 1500)
    },
    onError: (err) => {
      setActionError(err.message || 'Failed to approve listing')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (remarksText) => api.rejectListing(id, remarksText),
    onSuccess: () => {
      setActionSuccess('Listing rejected. Remarks sent to the seller for editing and resubmission.')
      queryClient.invalidateQueries({ queryKey: ['adminPendingListings'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      setTimeout(() => {
        navigate({ to: '/admin/dashboard/listings' })
      }, 1500)
    },
    onError: (err) => {
      setActionError(err.message || 'Failed to reject listing')
    },
  })

  const handleApprove = () => {
    setActionError('')
    approveMutation.mutate()
  }

  const handleReject = (e) => {
    e.preventDefault()
    setActionError('')
    if (remarks.trim().length < 10) {
      setActionError('Remarks must be at least 10 characters long to guide the seller.')
      return
    }
    rejectMutation.mutate(remarks.trim())
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p className="font-semibold">Listing Not Found</p>
          <p className="text-sm mt-1">{error?.message || 'The requested listing does not exist.'}</p>
          <Link
            to="/admin/dashboard/listings"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-800 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Pending Listings
          </Link>
        </div>
      </div>
    )
  }

  const images = (listing.images && listing.images.length > 0 ? listing.images : [listing.image]).filter(Boolean)

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/dashboard/listings"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Review Listing</h1>
            <p className="text-xs text-slate-500">ID: {listing._id} • Submitted {new Date(listing.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
              listing.status === 'approved'
                ? 'bg-emerald-100 text-emerald-800'
                : listing.status === 'rejected'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            Status: {listing.status}
          </span>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Listing Details & Media */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images Gallery */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Listing Photos</h3>
            {images.length === 0 ? (
              <div className="flex h-48 w-full items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <Package className="h-10 w-10 mr-2" />
                <span>No photos uploaded for this listing</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {images.map((img, idx) => {
                  const url = assetUrl(img)
                  return (
                    <div key={idx} className="overflow-hidden rounded-xl bg-slate-100 border border-slate-200 aspect-video">
                      {url ? (
                        <img src={url} alt={`Listing photo ${idx + 1}`} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Core Specifications */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-md bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                  {listing.plasticType} Plastic
                </span>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">{listing.title}</h2>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase text-slate-400 font-semibold">Price per kg</p>
                <p className="text-2xl font-black text-emerald-700">₹{listing.pricePerKg}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100 text-sm">
              <div>
                <p className="text-xs text-slate-400 font-medium">Quantity</p>
                <p className="font-bold text-slate-800">{listing.quantity} {listing.unit || 'kg'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Condition</p>
                <p className="font-bold text-slate-800">{listing.condition || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Collection Type</p>
                <p className="font-bold text-slate-800">{listing.collectionType || 'Standard'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Availability</p>
                <p className="font-bold text-slate-800">{listing.availability || 'Immediate'}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Description</h4>
              <p className="text-sm text-slate-700 whitespace-pre-line bg-slate-50 rounded-xl p-4 border border-slate-100">
                {listing.description || 'No description provided.'}
              </p>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <span>Location: <strong className="text-slate-800">{listing.location}</strong></span>
            </div>

            {/* Additional info */}
            {listing.additionalInfo && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Additional Notes</h4>
                <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  {listing.additionalInfo}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Seller Info & Moderation Actions */}
        <div className="space-y-6">
          {/* Seller Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Seller Information</h3>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-base font-bold text-emerald-800">
                {listing.seller?.fullName?.[0]?.toUpperCase() || 'S'}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{listing.seller?.fullName}</h4>
                <p className="text-xs text-slate-500 capitalize">{listing.seller?.sellerType || 'Individual'} Seller</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>{listing.seller?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{listing.seller?.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{listing.seller?.pickupAddress || listing.seller?.city || 'No address'}</span>
              </div>
              {listing.seller?.businessName && (
                <div className="flex items-center gap-2">
                  <Building className="h-3.5 w-3.5 text-slate-400" />
                  <span>Business: <strong>{listing.seller.businessName}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Moderation Checklist */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Review Checklist</h3>
            <p className="text-xs text-slate-400">Confirm standard listing quality criteria:</p>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.photosMatch}
                onChange={(e) => setChecklist({ ...checklist, photosMatch: e.target.checked })}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Photos match the plastic type</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.pricingRealistic}
                onChange={(e) => setChecklist({ ...checklist, pricingRealistic: e.target.checked })}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Quantity and price per kg are realistic</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.locationClear}
                onChange={(e) => setChecklist({ ...checklist, locationClear: e.target.checked })}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Pickup location is specific and valid</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.detailsComplete}
                onChange={(e) => setChecklist({ ...checklist, detailsComplete: e.target.checked })}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Title and description are sufficiently clear</span>
            </label>
          </div>

          {/* Action Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Moderation Decision</h3>

            {listing.status === 'approved' ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
                <p className="mt-1 text-sm font-bold text-emerald-900">Listing is Approved</p>
                <p className="text-xs text-emerald-700 mt-0.5">This listing is currently active on the marketplace.</p>
              </div>
            ) : listing.status === 'rejected' ? (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-4">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                  <XCircle className="h-5 w-5" /> Listing Rejected
                </div>
                {listing.rejectionRemarks && (
                  <p className="mt-2 text-xs text-rose-700 bg-white/70 p-2.5 rounded-lg border border-rose-100">
                    Remarks: {listing.rejectionRemarks}
                  </p>
                )}
                <button
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                  className="mt-3 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                >
                  Override & Approve
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {approveMutation.isPending ? 'Approving...' : 'Approve Listing'}
                </button>

                {!showRejectForm ? (
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-300 bg-rose-50/50 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject with Remarks
                  </button>
                ) : (
                  <form onSubmit={handleReject} className="space-y-3 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Remarks for Seller <span className="text-rose-500">* (min 10 chars)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Explain specifically what needs to be corrected (e.g., upload clearer photos, specify exact material grade)..."
                        className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      />
                      <p className="text-[11px] text-slate-400 mt-1 flex justify-between">
                        <span>Characters: {remarks.trim().length}</span>
                        {remarks.trim().length < 10 && <span className="text-amber-600">Min 10 characters</span>}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={rejectMutation.isPending || remarks.trim().length < 10}
                        className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
                      >
                        {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRejectForm(false)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
