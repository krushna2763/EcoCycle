import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Truck,
  HeadphonesIcon,
} from 'lucide-react'
import api from '../../services/api'
import { useApi } from '../../hooks/useApi'
import { useSocketEvent } from '../../hooks/useLiveUpdates'
import { scheduleText } from '../../lib/format'
import { conversationIdFor } from '../../lib/requests'

const STATUS_CONFIG = {
  accepted: { color: 'bg-emerald-50 text-emerald-600 border border-emerald-200', icon: CheckCircle2, label: 'Accepted' },
  scheduled: { color: 'bg-blue-50 text-blue-600 border border-blue-200', icon: Calendar, label: 'Scheduled' },
  in_progress: { color: 'bg-indigo-50 text-indigo-600 border border-indigo-200', icon: Truck, label: 'In Progress' },
  completed: { color: 'bg-teal-50 text-teal-600 border border-teal-200', icon: CheckCircle2, label: 'Completed' },
}

const ACTIVE_STATUSES = ['accepted', 'scheduled', 'in_progress', 'completed']

export default function BuyerCollections() {
  const [actionError, setActionError] = useState('')
  const [actingId, setActingId] = useState(null)
  const { data, loading, error, reload } = useApi(() => api.getBuyerRequests(), [])
  const collections = (data?.requests || []).filter((r) => ACTIVE_STATUSES.includes(r.status))

  useSocketEvent('notification', (n) => (n.type === 'collection' || n.type === 'request' ? reload() : null))

  const handleComplete = async (id) => {
    if (!window.confirm('Confirm that you have received this collection?')) return
    setActingId(id)
    setActionError('')
    try {
      await api.completeBuyerCollection(id)
      reload()
    } catch (err) {
      setActionError(err.message || 'Failed to confirm collection')
    } finally {
      setActingId(null)
    }
  }

  return (
    <div className="min-h-full bg-[#f8faf8] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">My Collections</h1>
          <p className="mt-1 text-sm text-slate-500">
            Scheduled pickups and completed procurement collections.
          </p>
        </div>

        {actionError && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {actionError}
          </div>
        )}

        {/* Collections list */}
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
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Truck className="h-12 w-12 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-600">No active collections</p>
            <p className="mt-1 text-xs text-slate-400">
              Accepted requests with scheduled pickups will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {collections.map((col) => {
              const st = STATUS_CONFIG[col.status] || STATUS_CONFIG.accepted
              const StatusIcon = st.icon
              const seller = col.seller || {}
              const busy = actingId === col._id
              return (
                <div key={col._id} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900">
                          {col.listing?.title || col.interestedPlasticType}
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {col.scheduledLocation || seller.pickupAddress || col.listing?.location || col.location}
                          </span>
                          <span>{col.quantity} kg</span>
                          {col.offerPrice && <span>₹{col.offerPrice}/kg</span>}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Seller: {seller.businessName || seller.fullName || 'EcoCycle Seller'}
                          {seller.phone && <span className="ml-2 inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {seller.phone}</span>}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${st.color}`}
                    >
                      <StatusIcon className="h-3 w-3" /> {st.label}
                    </span>
                  </div>

                  {(col.scheduledDate || col.status === 'completed') && (
                    <div className="mx-5 mb-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      <div>
                        <p className="text-xs font-bold text-blue-700">
                          {col.status === 'completed' ? 'Collection Completed' : col.status === 'in_progress' ? 'Collection In Progress' : 'Pickup Scheduled'}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-600">
                          {scheduleText(col) || 'Completed'}
                          {col.scheduledLocation && ` at ${col.scheduledLocation}`}
                        </p>
                        {col.scheduleNote && <p className="mt-0.5 text-xs text-slate-500">Note: {col.scheduleNote}</p>}
                      </div>
                    </div>
                  )}

                  {col.status === 'accepted' && !col.scheduledDate && (
                    <p className="mx-5 mb-4 text-xs text-slate-500">Waiting for the seller to schedule a pickup.</p>
                  )}

                  <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 px-5 py-4">
                    <Link
                      to="/buyer/dashboard/messages"
                      search={{ c: conversationIdFor(col) }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Message Seller
                    </Link>
                    {col.status !== 'completed' ? (
                      <button
                        onClick={() => handleComplete(col._id)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> {busy ? 'Confirming...' : 'Confirm Receipt'}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Confirmed
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Support */}
        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <HeadphonesIcon className="h-6 w-6 text-blue-600" strokeWidth={1.8} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Need help with a collection?</h3>
              <p className="mt-0.5 text-xs text-slate-500">Our support team is here to assist you.</p>
            </div>
          </div>
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
            <HeadphonesIcon className="h-4 w-4" />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}
