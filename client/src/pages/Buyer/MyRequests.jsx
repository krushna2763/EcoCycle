import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertCircle,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Truck,
  Ban,
  FileText,
} from 'lucide-react'
import api from '../../services/api'
import { useApi } from '../../hooks/useApi'
import { useSocketEvent } from '../../hooks/useLiveUpdates'
import { formatDate, scheduleText } from '../../lib/format'
import { conversationIdFor } from '../../lib/requests'

const TABS = [
  { label: 'All', statuses: null },
  { label: 'Pending', statuses: ['pending'] },
  { label: 'Accepted', statuses: ['accepted'] },
  { label: 'Scheduled', statuses: ['scheduled', 'in_progress'] },
  { label: 'Completed', statuses: ['completed'] },
  { label: 'Rejected', statuses: ['rejected'] },
  { label: 'Cancelled', statuses: ['cancelled'] },
]

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
  const [activeTab, setActiveTab] = useState('All')
  const [actionError, setActionError] = useState('')
  const [actingId, setActingId] = useState(null)
  const { data, loading, error, reload } = useApi(() => api.getBuyerRequests(), [])
  const requests = data?.requests || []

  // Seller decisions and schedule changes arrive as notifications
  useSocketEvent('notification', (n) => (n.type === 'request' || n.type === 'collection' ? reload() : null))

  const act = async (id, action) => {
    setActingId(id)
    setActionError('')
    try {
      await action()
      reload()
    } catch (err) {
      setActionError(err.message || 'Action failed')
    } finally {
      setActingId(null)
    }
  }

  const handleCancel = (id) => {
    const reason = window.prompt('Reason for cancellation (optional):')
    if (reason === null) return
    act(id, () => api.cancelBuyerRequest(id, reason.trim() || undefined))
  }

  const handleComplete = (id) => {
    if (!window.confirm('Confirm that this collection is complete?')) return
    act(id, () => api.completeBuyerCollection(id))
  }

  const tab = TABS.find((t) => t.label === activeTab)
  const filtered = requests.filter((r) => !tab.statuses || tab.statuses.includes(r.status))
  const countFor = (t) => (t.statuses ? requests.filter((r) => t.statuses.includes(r.status)).length : requests.length)

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
          <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {actionError}
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.label}
              onClick={() => setActiveTab(t.label)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === t.label
                  ? 'border border-blue-300 bg-blue-50 text-blue-700'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {t.label} ({countFor(t)})
            </button>
          ))}
        </div>

        {/* Requests list */}
        {loading && !data ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 py-12 text-center">
            <p className="text-sm font-semibold text-red-600">{error}</p>
            <button onClick={reload} className="mt-3 rounded-xl border border-red-300 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100">
              Try again
            </button>
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
              const seller = req.seller || {}
              const busy = actingId === req._id
              const isActive = ['accepted', 'scheduled', 'in_progress'].includes(req.status)
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
                          Seller: {seller.businessName || seller.fullName || 'EcoCycle Seller'} • {formatDate(req.createdAt)}
                        </p>
                        {(seller.phone || seller.email) && (
                          <p className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-slate-500">
                            {seller.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {seller.phone}</span>}
                            {seller.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {seller.email}</span>}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${st.color}`}
                    >
                      <StatusIcon className="h-3 w-3" /> {st.label}
                    </span>
                  </div>

                  {req.scheduledDate && (isActive || req.status === 'completed') && (
                    <div className="mx-5 mb-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-slate-600">
                      <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      <div>
                        <p className="font-bold text-blue-700">Pickup {req.status === 'completed' ? 'was scheduled' : 'scheduled'}</p>
                        <p className="mt-0.5">{scheduleText(req)}{req.scheduledLocation && ` at ${req.scheduledLocation}`}</p>
                        {req.scheduleNote && <p className="mt-0.5 text-slate-500">Note: {req.scheduleNote}</p>}
                      </div>
                    </div>
                  )}

                  {req.status === 'rejected' && (
                    <div className="mx-5 mb-4 rounded-xl border border-red-200 bg-red-50/60 p-3 text-xs text-slate-600">
                      <span className="font-semibold text-red-600">Declined by the seller</span>
                      {req.rejectionReason && <> — {req.rejectionReason}</>}
                    </div>
                  )}

                  {req.status === 'cancelled' && (
                    <div className="mx-5 mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                      <span className="font-semibold">Cancelled by {req.cancelledBy === 'seller' ? 'the seller' : 'you'}</span>
                      {req.cancellationReason && <> — {req.cancellationReason}</>}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 px-5 py-4">
                    <Link
                      to="/buyer/dashboard/messages"
                      search={{ c: conversationIdFor(req) }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Message Seller
                    </Link>
                    {req.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(req._id)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        <Ban className="h-3.5 w-3.5" /> Cancel Request
                      </button>
                    )}
                    {isActive && (
                      <>
                        <button
                          onClick={() => handleCancel(req._id)}
                          disabled={busy}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                        >
                          <Ban className="h-3.5 w-3.5" /> Cancel
                        </button>
                        <button
                          onClick={() => handleComplete(req._id)}
                          disabled={busy}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
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
