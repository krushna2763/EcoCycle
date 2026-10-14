import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Clock,
  HeadphonesIcon,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Recycle,
  Truck,
  X,
  XCircle,
  ArrowRight,
} from 'lucide-react'
import api from '../../services/api'
import { useApi } from '../../hooks/useApi'
import { announceRequestsChanged, useSocketEvent } from '../../hooks/useLiveUpdates'
import { formatDate, formatDateTime, scheduleText } from '../../lib/format'
import { conversationIdFor } from '../../lib/requests'

const TABS = [
  { label: 'All Requests', statuses: null },
  { label: 'Pending', statuses: ['pending'] },
  { label: 'Accepted', statuses: ['accepted', 'scheduled', 'in_progress'] },
  { label: 'Rejected', statuses: ['rejected'] },
  { label: 'Completed', statuses: ['completed'] },
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

const GRADIENTS = ['from-blue-400 to-cyan-300', 'from-amber-300 to-orange-300', 'from-emerald-400 to-teal-300', 'from-violet-400 to-purple-300']
const LOGO_BGS = ['bg-emerald-100', 'bg-brand-100', 'bg-blue-100', 'bg-violet-100']

const statusTime = (req) => {
  switch (req.status) {
    case 'pending': return `Requested on ${formatDateTime(req.createdAt)}`
    case 'rejected': return `Rejected on ${formatDateTime(req.rejectedAt || req.updatedAt)}`
    case 'cancelled': return `Cancelled on ${formatDateTime(req.cancelledAt || req.updatedAt)}`
    case 'completed': return `Completed on ${formatDateTime(req.completedAt || req.updatedAt)}`
    default: return `Accepted on ${formatDateTime(req.acceptedAt || req.updatedAt)}`
  }
}

export default function Requests() {
  const [activeTab, setActiveTab] = useState('All Requests')
  const [actingId, setActingId] = useState(null)
  const [actionError, setActionError] = useState('')
  const { data, loading, error, reload } = useApi(() => api.getRequests(), [])
  const requests = data?.requests || []

  // New requests and buyer cancellations arrive as notifications
  useSocketEvent('notification', (n) => n.type === 'request' || n.type === 'collection' ? reload() : null)

  const tab = TABS.find((t) => t.label === activeTab)
  const filteredRequests = requests.filter((r) => !tab.statuses || tab.statuses.includes(r.status))
  const countFor = (t) => (t.statuses ? requests.filter((r) => t.statuses.includes(r.status)).length : requests.length)

  const act = async (id, action) => {
    setActingId(id)
    setActionError('')
    try {
      await action()
      announceRequestsChanged()
      reload()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setActingId(null)
    }
  }

  const handleAccept = (id) => act(id, () => api.acceptRequest(id))

  const handleDecline = (id) => {
    const reason = window.prompt('Reason for declining (optional):')
    if (reason === null) return
    act(id, () => api.rejectRequest(id, reason.trim() || undefined))
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Requests</h1>
        <p className="mt-1 text-sm text-slate-500">View and manage interest requests from recycling companies.</p>

        {/* Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200">
          {TABS.map((t) => {
            const isActive = activeTab === t.label
            return (
              <button
                key={t.label}
                onClick={() => setActiveTab(t.label)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
                <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                  isActive ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {countFor(t)}
                </span>
              </button>
            )
          })}
        </div>

        {actionError && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {actionError}
          </div>
        )}

        {/* Request cards */}
        <div className="mt-6 space-y-5">
          {loading && !data && (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="text-sm font-medium text-red-600">{error}</p>
              <button onClick={reload} className="mt-3 rounded-xl border border-red-300 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100">
                Try again
              </button>
            </div>
          )}

          {data && filteredRequests.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <Recycle className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-500">No requests found</p>
            </div>
          )}

          {filteredRequests.map((req, idx) => {
            const st = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending
            const StatusIcon = st.icon
            const buyer = req.buyer || {}
            const isActive = ['accepted', 'scheduled', 'in_progress'].includes(req.status)
            const busy = actingId === req._id
            return (
              <div key={req._id} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Top section: 3 columns */}
                <div className="grid gap-0 sm:grid-cols-[1fr_1fr_auto]">
                  {/* Company info */}
                  <div className="border-b border-slate-100 p-5 sm:border-b-0 sm:border-r sm:pr-5">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-slate-700 ${LOGO_BGS[idx % LOGO_BGS.length]}`}>
                        {(req.companyName || 'B').charAt(0)}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{req.companyName}</p>
                        {buyer.verificationStatus === 'verified' && (
                          <span className="flex items-center gap-1 text-xs text-brand-600">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-xs text-slate-500">
                      {(buyer.phone || req.buyerPhone) && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-400" /> {buyer.phone || req.buyerPhone}</p>}
                      {(buyer.email || req.buyerEmail) && <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-400" /> {buyer.email || req.buyerEmail}</p>}
                      <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {req.location || buyer.city}</p>
                    </div>
                  </div>

                  {/* Interested in */}
                  <div className="border-b border-slate-100 p-5 sm:border-b-0 sm:border-r sm:pl-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Interested in</p>
                    <div className="mt-3 flex gap-3">
                      <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]}`}>
                        <Recycle className="h-7 w-7 text-white" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{req.listing?.title || req.interestedPlasticType}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <span>{req.quantity} kg</span>
                          <span>·</span>
                          <span>Offer ₹{req.offerPrice ?? req.listing?.pricePerKg} / kg</span>
                        </div>
                        {req.listing?.location && <p className="mt-0.5 text-xs text-slate-500">{req.listing.location}</p>}
                        {req.listing?.createdAt && <p className="mt-0.5 text-[11px] text-slate-400">Listed on {formatDate(req.listing.createdAt)}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex flex-col items-end justify-between p-5">
                    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${st.color}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {st.label}
                    </span>
                    <p className="mt-2 text-right text-[11px] text-slate-400">{statusTime(req)}</p>
                  </div>
                </div>

                {/* Message / Collection / Reason */}
                {req.message && (
                  <div className="mx-5 mb-4 flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <span className="mt-0.5 text-lg">💬</span>
                    <p className="text-sm text-slate-600">{req.message}</p>
                  </div>
                )}

                {req.scheduledDate && isActive && (
                  <div className="mx-5 mb-4 flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-4">
                    <span className="mt-0.5 text-lg">📦</span>
                    <div>
                      <p className="text-sm font-bold text-brand-700">Collection Scheduled</p>
                      <p className="mt-0.5 text-xs text-slate-600">{scheduleText(req)}{req.scheduledLocation && ` • ${req.scheduledLocation}`}</p>
                    </div>
                  </div>
                )}

                {req.status === 'rejected' && req.rejectionReason && (
                  <div className="mx-5 mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/60 p-4">
                    <span className="mt-0.5 text-lg">⚠️</span>
                    <div>
                      <p className="text-sm font-bold text-red-600">Reason</p>
                      <p className="mt-0.5 text-xs text-slate-600">{req.rejectionReason}</p>
                    </div>
                  </div>
                )}

                {req.status === 'cancelled' && (
                  <div className="mx-5 mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                    Cancelled by {req.cancelledBy === 'seller' ? 'you' : 'the buyer'}
                    {req.cancellationReason && <> — {req.cancellationReason}</>}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 px-5 py-4">
                  <Link
                    to="/seller/dashboard/messages"
                    search={{ c: conversationIdFor(req) }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-700"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Message
                  </Link>
                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleDecline(req._id)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 px-4 py-2.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        <X className="h-3.5 w-3.5" />
                        Decline
                      </button>
                      <button
                        onClick={() => handleAccept(req._id)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand-deep px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-brand-deeper disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {busy ? 'Saving...' : 'Accept'}
                      </button>
                    </>
                  )}
                  {(isActive || req.status === 'completed') && (
                    <Link
                      to="/seller/dashboard/collections"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-700"
                    >
                      {isActive ? 'Manage Collection' : 'View Collection'}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Support section */}
        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-brand-200 bg-brand-50/50 p-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100">
              <HeadphonesIcon className="h-6 w-6 text-brand-600" strokeWidth={1.8} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Need help managing requests?</h3>
              <p className="mt-0.5 text-xs text-slate-500">Our support team is here to assist you with any queries.</p>
            </div>
          </div>
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-deeper">
            <HeadphonesIcon className="h-4 w-4" />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}
