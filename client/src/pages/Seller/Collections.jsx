import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertCircle,
  Ban,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  HeadphonesIcon,
  MapPin,
  MessageSquare,
  Play,
  Recycle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Send,
  Info,
} from 'lucide-react'
import api, { assetUrl } from '../../services/api'
import { useApi } from '../../hooks/useApi'
import { announceRequestsChanged, useSocketEvent } from '../../hooks/useLiveUpdates'
import { formatDate, shortId } from '../../lib/format'
import { conversationIdFor, csvCell, isCollection } from '../../lib/requests'

const STATUS_CONFIG = {
  accepted: { color: 'bg-emerald-50 text-emerald-600 border border-emerald-200', label: 'Accepted' },
  scheduled: { color: 'bg-amber-50 text-amber-600 border border-amber-200', label: 'Scheduled' },
  in_progress: { color: 'bg-blue-50 text-blue-600 border border-blue-200', label: 'In Progress' },
  completed: { color: 'bg-emerald-50 text-emerald-600 border border-emerald-200', label: 'Completed' },
  cancelled: { color: 'bg-red-50 text-red-500 border border-red-200', label: 'Cancelled' },
}

const TAB_STATUS = {
  All: null,
  Accepted: 'accepted',
  Scheduled: 'scheduled',
  'In Progress': 'in_progress',
  Completed: 'completed',
  Cancelled: 'cancelled',
}

const CARD_STYLES = [
  { gradient: 'from-blue-400 to-cyan-300', emoji: '🧴' },
  { gradient: 'from-amber-300 to-orange-300', emoji: '🫙' },
  { gradient: 'from-emerald-400 to-teal-300', emoji: '♻️' },
  { gradient: 'from-violet-400 to-purple-300', emoji: '📦' },
]

// Value for <input type="date"> / <input type="time"> from stored schedule strings
const dateInputValue = (value) => (/^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value : '')
const timeInputValue = (value) => (/^\d{2}:\d{2}$/.test(value || '') ? value : '')

const dateLine = (col) => {
  if (col.status === 'completed') return `Completed on ${formatDate(col.completedAt || col.updatedAt)}`
  if (col.status === 'cancelled') return `Cancelled on ${formatDate(col.cancelledAt || col.updatedAt)}`
  if (col.scheduledDate) return `Scheduled for ${formatDate(col.scheduledDate)}`
  return `Accepted on ${formatDate(col.acceptedAt || col.updatedAt)}`
}

export default function Collections() {
  const [activeTab, setActiveTab] = useState('All')
  const [expandedSchedule, setExpandedSchedule] = useState(null)
  const [expandedDetails, setExpandedDetails] = useState(null)
  const [scheduleForm, setScheduleForm] = useState({ date: '', time: '', location: '', note: '' })
  const [actingId, setActingId] = useState(null)
  const [actionError, setActionError] = useState('')
  const { data, loading, error, reload } = useApi(
    () => api.getRequests({ status: 'accepted,scheduled,in_progress,completed,cancelled' }),
    []
  )
  const collections = (data?.requests || []).filter(isCollection)

  // Buyer confirmations and cancellations arrive as notifications
  useSocketEvent('notification', (n) => (n.type === 'collection' ? reload() : null))

  const tabs = Object.keys(TAB_STATUS).map((label) => ({
    label,
    count: TAB_STATUS[label] ? collections.filter((c) => c.status === TAB_STATUS[label]).length : collections.length,
  }))

  const filtered = collections.filter((c) => !TAB_STATUS[activeTab] || c.status === TAB_STATUS[activeTab])

  const act = async (id, action) => {
    setActingId(id)
    setActionError('')
    try {
      await action()
      announceRequestsChanged()
      reload()
      return true
    } catch (err) {
      setActionError(err.message)
      return false
    } finally {
      setActingId(null)
    }
  }

  const openSchedule = (col) => {
    setExpandedSchedule(col._id)
    setExpandedDetails(null)
    setScheduleForm({
      date: dateInputValue(col.scheduledDate),
      time: timeInputValue(col.scheduledTime),
      location: col.scheduledLocation || col.listing?.location || '',
      note: col.scheduleNote || '',
    })
  }

  const handleSendSchedule = async (id) => {
    if (!scheduleForm.date) {
      setActionError('Choose a collection date')
      return
    }
    const ok = await act(id, () => api.scheduleCollection(id, {
      scheduledDate: scheduleForm.date,
      scheduledTime: scheduleForm.time || undefined,
      scheduledLocation: scheduleForm.location.trim() || undefined,
      scheduleNote: scheduleForm.note.trim(),
    }))
    if (ok) {
      setExpandedSchedule(null)
      setScheduleForm({ date: '', time: '', location: '', note: '' })
    }
  }

  const handleStatus = (id, status) => act(id, () => api.updateRequestStatus(id, status))

  const handleCancel = (id) => {
    const reason = window.prompt('Reason for cancelling this collection (optional):')
    if (reason === null) return
    act(id, () => api.updateRequestStatus(id, 'cancelled', reason.trim() || undefined))
  }

  const downloadReport = () => {
    const headers = ['Collection ID', 'Material', 'Company', 'Quantity (kg)', 'Price/kg', 'Location', 'Status', 'Date']
    const rows = collections.map((c) => [
      shortId(c._id), c.listing?.title || c.interestedPlasticType, c.companyName, c.quantity,
      c.offerPrice ?? c.listing?.pricePerKg, c.scheduledLocation || c.location, STATUS_CONFIG[c.status]?.label, dateLine(c),
    ])
    const csv = [headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ecocycle-collections-report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Collections</h1>
            <p className="mt-1 text-sm text-slate-500">Track and manage your plastic waste collections.</p>
          </div>
          {collections.length > 0 && (
            <button
              onClick={downloadReport}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:border-brand-400 hover:text-brand-700"
            >
              <Download className="h-3.5 w-3.5" />
              Download Report
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200">
          {tabs.map(({ label, count }) => {
            const isActive = activeTab === label
            return (
              <button
                key={label}
                onClick={() => setActiveTab(label)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all ${
                  isActive ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
                <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                  isActive ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
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

        {/* Collection cards */}
        <div className="mt-6 space-y-4">
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

          {data && filtered.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <Recycle className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-500">No collections found</p>
              <p className="mt-1 text-xs text-slate-400">Accepted requests appear here.</p>
            </div>
          )}

          {filtered.map((col, idx) => {
            const st = STATUS_CONFIG[col.status] || STATUS_CONFIG.accepted
            const { gradient, emoji } = CARD_STYLES[idx % CARD_STYLES.length]
            const cover = assetUrl(col.listing?.image)
            const isScheduleExpanded = expandedSchedule === col._id
            const isDetailsExpanded = expandedDetails === col._id
            const busy = actingId === col._id
            const isActive = ['accepted', 'scheduled', 'in_progress'].includes(col.status)
            const price = col.offerPrice ?? col.listing?.pricePerKg

            return (
              <div key={col._id} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Main card row */}
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className={`flex h-44 shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br ${gradient} sm:h-auto sm:w-44`}>
                    {cover ? <img src={cover} alt="" className="h-full w-full object-cover" /> : <span className="text-4xl">{emoji}</span>}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{col.listing?.title || col.interestedPlasticType}</h3>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                          <Recycle className="h-3.5 w-3.5 text-brand-500" />
                          {col.companyName}
                          {col.buyer?.verificationStatus === 'verified' && <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" />}
                        </div>
                        <div className="mt-1.5 flex items-center text-xs text-slate-500">
                          <span>{col.quantity} kg</span>
                          {price && (
                            <>
                              <span className="mx-1.5 text-slate-300">·</span>
                              <span>₹{price} / kg</span>
                            </>
                          )}
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="h-3 w-3 text-slate-400" /> {col.scheduledLocation || col.location}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="h-3 w-3 text-slate-400" /> {dateLine(col)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${st.color}`}>{st.label}</span>
                        <p className="mt-1 text-[11px] text-slate-400">ID: {shortId(col._id)}</p>
                      </div>
                    </div>

                    {/* Inline schedule info for scheduled/in-progress/completed */}
                    {['scheduled', 'in_progress', 'completed'].includes(col.status) && col.scheduledDate && (
                      <div className="mt-3 flex flex-wrap items-center gap-4 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-slate-400" /> {formatDate(col.scheduledDate)}</span>
                        {col.scheduledTime && <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-slate-400" /> {col.scheduledTime}</span>}
                        {col.scheduledLocation && <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-400" /> {col.scheduledLocation}</span>}
                      </div>
                    )}

                    {/* Cancelled info */}
                    {col.status === 'cancelled' && (
                      <div className="mt-3 rounded-lg border border-red-200 bg-red-50/60 px-3 py-2 text-xs text-slate-600">
                        <span className="font-medium text-red-500">Cancelled by {col.cancelledBy === 'seller' ? 'you' : 'the buyer'}</span>
                        {col.cancellationReason && <span className="ml-2 text-slate-500">Reason: {col.cancellationReason}</span>}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {col.status === 'accepted' && !isScheduleExpanded && (
                        <button
                          onClick={() => openSchedule(col)}
                          className="inline-flex items-center gap-2 rounded-xl border border-brand-300 px-4 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          Schedule Collection
                        </button>
                      )}
                      {col.status === 'scheduled' && !isScheduleExpanded && (
                        <>
                          <button
                            onClick={() => openSchedule(col)}
                            className="inline-flex items-center gap-2 rounded-xl border border-brand-300 px-4 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleStatus(col._id, 'in_progress')}
                            disabled={busy}
                            className="inline-flex items-center gap-2 rounded-xl border border-blue-300 px-4 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50 disabled:opacity-50"
                          >
                            <Play className="h-3.5 w-3.5" />
                            Start Collection
                          </button>
                        </>
                      )}
                      {['scheduled', 'in_progress'].includes(col.status) && (
                        <button
                          onClick={() => handleStatus(col._id, 'completed')}
                          disabled={busy}
                          className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-deeper disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Mark Completed
                        </button>
                      )}
                      {isActive && (
                        <button
                          onClick={() => handleCancel(col._id)}
                          disabled={busy}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-300 px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          Cancel
                        </button>
                      )}
                      <Link
                        to="/seller/dashboard/messages"
                        search={{ c: conversationIdFor(col) }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-700"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Message
                      </Link>
                      <button
                        onClick={() => setExpandedDetails(isDetailsExpanded ? null : col._id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-700"
                      >
                        View Details
                        <ArrowRight className="h-3 w-3.5" />
                      </button>
                      <button
                        aria-label={isDetailsExpanded ? 'Hide details' : 'Show details'}
                        onClick={() => setExpandedDetails(isDetailsExpanded ? null : col._id)}
                        className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                      >
                        {isDetailsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline Schedule Form */}
                {isScheduleExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-5">
                    <div className="flex items-center gap-2 text-sm font-bold text-brand-700">
                      <Calendar className="h-4 w-4" />
                      {col.status === 'scheduled' ? 'Reschedule Collection' : 'Schedule Collection'}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Select date, time and location for the collection</p>

                    <div className="mt-4 grid gap-4 sm:grid-cols-4">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">Date</label>
                        <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <input type="date" value={scheduleForm.date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setScheduleForm((p) => ({ ...p, date: e.target.value }))} className="w-full bg-transparent text-sm outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">Time</label>
                        <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <input type="time" value={scheduleForm.time} onChange={(e) => setScheduleForm((p) => ({ ...p, time: e.target.value }))} className="w-full bg-transparent text-sm outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">Location</label>
                        <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <input type="text" value={scheduleForm.location} maxLength={300} onChange={(e) => setScheduleForm((p) => ({ ...p, location: e.target.value }))} className="w-full bg-transparent text-sm outline-none" placeholder="Pickup location" />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">Note <span className="text-slate-400">(Optional)</span></label>
                        <input type="text" value={scheduleForm.note} maxLength={300} onChange={(e) => setScheduleForm((p) => ({ ...p, note: e.target.value }))} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none" placeholder="Any special instructions..." />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Info className="h-3.5 w-3.5" />
                        The recycler will be notified of this schedule.
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setExpandedSchedule(null)} className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSendSchedule(col._id)}
                          disabled={busy}
                          className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-6 py-2.5 text-xs font-semibold text-white hover:bg-brand-deeper disabled:opacity-50"
                        >
                          <Send className="h-3.5 w-3.5" />
                          {busy ? 'Sending...' : 'Send Schedule'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expanded Details */}
                {isDetailsExpanded && (
                  <div className="border-t border-slate-100 p-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <DetailRow label="Collection ID" value={shortId(col._id)} />
                      <DetailRow label="Material" value={col.listing?.title || col.interestedPlasticType} />
                      <DetailRow label="Company" value={col.companyName} />
                      <DetailRow label="Contact" value={col.buyer?.phone || col.buyerPhone} />
                      <DetailRow label="Quantity" value={`${col.quantity} kg`} />
                      <DetailRow label="Offer Price" value={price ? `₹${price} / kg` : '—'} />
                      <DetailRow label="Buyer Location" value={col.location} />
                      <DetailRow label="Status" value={<span className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold ${st.color}`}>{st.label}</span>} />
                      <DetailRow label="Requested On" value={formatDate(col.createdAt)} />
                      {col.scheduledDate && <DetailRow label="Scheduled Date" value={formatDate(col.scheduledDate)} />}
                      {col.scheduledTime && <DetailRow label="Scheduled Time" value={col.scheduledTime} />}
                      {col.scheduledLocation && <DetailRow label="Pickup Location" value={col.scheduledLocation} />}
                      {col.scheduleNote && <DetailRow label="Note" value={col.scheduleNote} />}
                      {col.status === 'cancelled' && col.cancellationReason && <DetailRow label="Reason" value={col.cancellationReason} />}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Support */}
        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-brand-200 bg-brand-50/50 p-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100">
              <HeadphonesIcon className="h-6 w-6 text-brand-600" strokeWidth={1.8} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Need help with your collections?</h3>
              <p className="mt-0.5 text-xs text-slate-500">Our support team is here to assist you.</p>
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

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-medium text-slate-900">{value || '—'}</span>
    </div>
  )
}
