import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  HeadphonesIcon,
  MapPin,
  Recycle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Send,
  Info,
} from 'lucide-react'

const COLLECTIONS = [
  {
    id: 'COL-2026-0816-001',
    plasticType: 'PET Plastic Bottles',
    company: 'GreenCycle Pvt. Ltd.',
    verified: true,
    quantity: '50 kg',
    price: '₹30 / kg',
    location: 'Kothrud, Pune, Maharashtra',
    date: 'Requested on 16 Aug 2026',
    status: 'accepted',
    gradient: 'from-blue-400 to-cyan-300',
    emoji: '🧴',
  },
  {
    id: 'COL-2026-0818-002',
    plasticType: 'HDPE Containers',
    company: 'Eco Recyclers',
    verified: true,
    quantity: '25 kg',
    price: '₹25 / kg',
    location: 'Pimpri, Pune, Maharashtra',
    date: 'Scheduled on 20 Aug 2026',
    status: 'scheduled',
    scheduledDate: '20 Aug 2026',
    scheduledTime: '02:00 PM',
    scheduledLocation: 'Pimpri, Pune, Maharashtra',
    gradient: 'from-amber-300 to-orange-300',
    emoji: '🫙',
  },
  {
    id: 'COL-2026-0810-003',
    plasticType: 'Mixed Plastic',
    company: 'ReUse Industries',
    verified: true,
    quantity: '30 kg',
    price: '₹20 / kg',
    location: 'Viman Nagar, Pune, Maharashtra',
    date: 'Scheduled on 10 Aug 2026',
    status: 'in-progress',
    scheduledDate: '10 Aug 2026',
    scheduledTime: '09:45 AM',
    scheduledLocation: 'Viman Nagar, Pune, Maharashtra',
    gradient: 'from-emerald-400 to-teal-300',
    emoji: '♻️',
  },
  {
    id: 'COL-2026-0801-004',
    plasticType: 'LDPE Plastic Wraps',
    company: 'Planet Recycle Co.',
    verified: true,
    quantity: '10 kg',
    price: '₹12 / kg',
    location: 'Chinchwad, Pune, Maharashtra',
    date: 'Scheduled on 01 Aug 2026',
    status: 'completed',
    scheduledDate: '01 Aug 2026',
    scheduledTime: '04:20 PM',
    scheduledLocation: 'Chinchwad, Pune, Maharashtra',
    gradient: 'from-violet-400 to-purple-300',
    emoji: '📦',
  },
  {
    id: 'COL-2026-0725-005',
    plasticType: 'HDPE Crates',
    company: 'GreenCycle Pvt. Ltd.',
    verified: true,
    quantity: '40 kg',
    price: '₹28 / kg',
    location: 'Kothrud, Pune, Maharashtra',
    date: 'Requested on 25 Jul 2026',
    status: 'cancelled',
    cancelledDate: '26 Jul 2026',
    cancelledReason: 'Pickup location not serviceable.',
    gradient: 'from-sky-400 to-blue-300',
    emoji: '📦',
  },
]

const STATUS_CONFIG = {
  accepted: { color: 'bg-emerald-50 text-emerald-600 border border-emerald-200', label: 'Accepted' },
  scheduled: { color: 'bg-amber-50 text-amber-600 border border-amber-200', label: 'Scheduled' },
  'in-progress': { color: 'bg-blue-50 text-blue-600 border border-blue-200', label: 'In Progress' },
  completed: { color: 'bg-emerald-50 text-emerald-600 border border-emerald-200', label: 'Completed' },
  cancelled: { color: 'bg-red-50 text-red-500 border border-red-200', label: 'Cancelled' },
}

export default function Collections() {
  const [activeTab, setActiveTab] = useState('All')
  const [collections, setCollections] = useState(COLLECTIONS)
  const [expandedSchedule, setExpandedSchedule] = useState(null)
  const [expandedDetails, setExpandedDetails] = useState(null)
  const [scheduleForm, setScheduleForm] = useState({ date: '', time: '', location: '', note: '' })

  const tabs = [
    { label: 'All', count: collections.length },
    { label: 'Accepted', count: collections.filter((c) => c.status === 'accepted').length },
    { label: 'Scheduled', count: collections.filter((c) => c.status === 'scheduled').length },
    { label: 'In Progress', count: collections.filter((c) => c.status === 'in-progress').length },
    { label: 'Completed', count: collections.filter((c) => c.status === 'completed').length },
    { label: 'Cancelled', count: collections.filter((c) => c.status === 'cancelled').length },
  ]

  const filtered = collections.filter((c) => {
    if (activeTab === 'All') return true
    if (activeTab === 'In Progress') return c.status === 'in-progress'
    return c.status === activeTab.toLowerCase()
  })

  const handleSendSchedule = (id) => {
    setCollections((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: 'scheduled', scheduledDate: scheduleForm.date || '21 Aug 2026', scheduledTime: scheduleForm.time || '02:00 PM', scheduledLocation: scheduleForm.location || c.location }
          : c
      )
    )
    setExpandedSchedule(null)
    setScheduleForm({ date: '', time: '', location: '', note: '' })
  }

  const downloadReport = () => {
    const headers = ['Collection ID', 'Plastic Type', 'Company', 'Quantity', 'Price/kg', 'Location', 'Status', 'Date']
    const rows = collections.map((c) => [c.id, c.plasticType, c.company, c.quantity, c.price, c.location, STATUS_CONFIG[c.status].label, c.date])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
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
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Collections</h1>
        <p className="mt-1 text-sm text-slate-500">Track and manage your plastic waste collections.</p>

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

        {/* Collection cards */}
        <div className="mt-6 space-y-4">
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <Recycle className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-500">No collections found</p>
            </div>
          )}

          {filtered.map((col) => {
            const st = STATUS_CONFIG[col.status]
            const isScheduleExpanded = expandedSchedule === col.id
            const isDetailsExpanded = expandedDetails === col.id

            return (
              <div key={col.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Main card row */}
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className={`flex h-44 shrink-0 items-center justify-center bg-gradient-to-br ${col.gradient} sm:h-auto sm:w-44`}>
                    <span className="text-4xl">{col.emoji}</span>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{col.plasticType}</h3>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                          <Recycle className="h-3.5 w-3.5 text-brand-500" />
                          {col.company}
                          {col.verified && <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" />}
                        </div>
                        <div className="mt-1.5 flex items-center text-xs text-slate-500">
                          <span>{col.quantity}</span>
                          <span className="mx-1.5 text-slate-300">·</span>
                          <span>{col.price}</span>
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="h-3 w-3 text-slate-400" /> {col.location}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="h-3 w-3 text-slate-400" /> {col.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${st.color}`}>{st.label}</span>
                        <p className="mt-1 text-[11px] text-slate-400">ID: {col.id}</p>
                      </div>
                    </div>

                    {/* Inline schedule info for scheduled/in-progress/completed */}
                    {(col.status === 'scheduled' || col.status === 'in-progress' || col.status === 'completed') && col.scheduledDate && (
                      <div className="mt-3 flex flex-wrap items-center gap-4 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-slate-400" /> {col.scheduledDate}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-slate-400" /> {col.scheduledTime}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-400" /> {col.scheduledLocation}</span>
                      </div>
                    )}

                    {/* Cancelled info */}
                    {col.status === 'cancelled' && (
                      <div className="mt-3 rounded-lg border border-red-200 bg-red-50/60 px-3 py-2 text-xs text-slate-600">
                        <span className="text-red-500 font-medium">Cancelled on {col.cancelledDate}</span>
                        <span className="ml-2 text-slate-500">Reason: {col.cancelledReason}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-3 flex items-center gap-2">
                      {col.status === 'accepted' && !isScheduleExpanded && (
                        <button
                          onClick={() => { setExpandedSchedule(col.id); setExpandedDetails(null); setScheduleForm({ date: '', time: '', location: col.location, note: '' }) }}
                          className="inline-flex items-center gap-2 rounded-xl border border-brand-300 px-4 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          Schedule Collection
                        </button>
                      )}
                      {col.status === 'scheduled' && (
                        <button
                          onClick={() => { setExpandedSchedule(col.id); setExpandedDetails(null); setScheduleForm({ date: col.scheduledDate, time: col.scheduledTime, location: col.scheduledLocation, note: '' }) }}
                          className="inline-flex items-center gap-2 rounded-xl border border-brand-300 px-4 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          Reschedule
                        </button>
                      )}
                      <button
                        onClick={() => setExpandedDetails(isDetailsExpanded ? null : col.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-700"
                      >
                        View Details
                        <ArrowRight className="h-3 w-3.5" />
                      </button>
                      <button
                        onClick={() => setExpandedDetails(isDetailsExpanded ? null : col.id)}
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
                      Schedule Collection
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Select date, time and location for the collection</p>

                    <div className="mt-4 grid gap-4 sm:grid-cols-4">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">Date</label>
                        <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <input type="date" value={scheduleForm.date} onChange={(e) => setScheduleForm((p) => ({ ...p, date: e.target.value }))} className="w-full bg-transparent text-sm outline-none" />
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
                          <input type="text" value={scheduleForm.location} onChange={(e) => setScheduleForm((p) => ({ ...p, location: e.target.value }))} className="w-full bg-transparent text-sm outline-none" placeholder="Pickup location" />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">Note <span className="text-slate-400">(Optional)</span></label>
                        <input type="text" value={scheduleForm.note} onChange={(e) => setScheduleForm((p) => ({ ...p, note: e.target.value }))} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none" placeholder="Any special instructions..." />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Info className="h-3.5 w-3.5" />
                        Recycler will be notified and must confirm this schedule.
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setExpandedSchedule(null)} className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSendSchedule(col.id)}
                          className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-6 py-2.5 text-xs font-semibold text-white hover:bg-brand-deeper"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Send Schedule
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expanded Details */}
                {isDetailsExpanded && (
                  <div className="border-t border-slate-100 p-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <DetailRow label="Collection ID" value={col.id} />
                      <DetailRow label="Plastic Type" value={col.plasticType} />
                      <DetailRow label="Company" value={col.company} />
                      <DetailRow label="Quantity" value={col.quantity} />
                      <DetailRow label="Price" value={col.price} />
                      <DetailRow label="Location" value={col.location} />
                      <DetailRow label="Status" value={<span className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold ${st.color}`}>{st.label}</span>} />
                      <DetailRow label="Date" value={col.date} />
                      {col.scheduledDate && <DetailRow label="Scheduled Date" value={col.scheduledDate} />}
                      {col.scheduledTime && <DetailRow label="Scheduled Time" value={col.scheduledTime} />}
                      {col.scheduledLocation && <DetailRow label="Pickup Location" value={col.scheduledLocation} />}
                      {col.status === 'cancelled' && col.cancelledReason && <DetailRow label="Reason" value={col.cancelledReason} />}
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
          <button className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-deeper">
            <HeadphonesIcon className="h-4 w-4" />
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-medium text-slate-900">{value}</span>
    </div>
  )
}
