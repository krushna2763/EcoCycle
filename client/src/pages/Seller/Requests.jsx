import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  CheckCircle2,
  Clock,
  HeadphonesIcon,
  Mail,
  MapPin,
  Phone,
  Recycle,
  X,
  XCircle,
  ArrowRight,
} from 'lucide-react'

const REQUESTS = [
  {
    id: 1,
    company: 'GreenCycle Pvt. Ltd.',
    verified: true,
    phone: '+91 98765 43210',
    email: 'greencycle@gmail.com',
    location: 'Pune, Maharashtra',
    logo: '🌿',
    logoBg: 'bg-emerald-100',
    interestedIn: 'PET Plastic Bottles',
    quantity: '50 kg',
    price: '₹30 / kg',
    listingLocation: 'Pune, Maharashtra',
    listedOn: '15 Aug 2024',
    status: 'pending',
    requestedOn: '16 Aug 2024, 10:30 AM',
    message: 'Hi, we are interested in your PET bottles. Please let us know if collection is possible.',
    gradient: 'from-blue-400 to-cyan-300',
  },
  {
    id: 2,
    company: 'Eco Recyclers',
    verified: true,
    phone: '+91 91234 56789',
    email: 'info@ecorecyclers.com',
    location: 'Pimpri, Maharashtra',
    logo: '♻️',
    logoBg: 'bg-brand-100',
    interestedIn: 'HDPE Containers',
    quantity: '25 kg',
    price: '₹25 / kg',
    listingLocation: 'Pimpri, Maharashtra',
    listedOn: '18 Aug 2024',
    status: 'accepted',
    acceptedOn: '20 Aug 2024, 02:15 PM',
    collectionDate: '20 Aug 2024, 11:00 AM',
    collectionLocation: 'Pimpri, Maharashtra',
    gradient: 'from-amber-300 to-orange-300',
  },
  {
    id: 3,
    company: 'ReUse Industries',
    verified: true,
    phone: '+91 99876 54321',
    email: 'reuseindustries@gmail.com',
    location: 'Pune, Maharashtra',
    logo: '🏭',
    logoBg: 'bg-blue-100',
    interestedIn: 'Mixed Plastic',
    quantity: '30 kg',
    price: '₹20 / kg',
    listingLocation: 'Pune, Maharashtra',
    listedOn: '10 Aug 2024',
    status: 'rejected',
    rejectedOn: '11 Aug 2024, 09:45 AM',
    reason: "Currently we don't handle mixed plastic.",
    gradient: 'from-emerald-400 to-teal-300',
  },
  {
    id: 4,
    company: 'Planet Recycle Co.',
    verified: true,
    phone: '+91 87654 32109',
    email: 'planet@recycle.com',
    location: 'Chinchwad, Maharashtra',
    logo: '🌍',
    logoBg: 'bg-violet-100',
    interestedIn: 'LDPE Plastic Wraps',
    quantity: '10 kg',
    price: '₹12 / kg',
    listingLocation: 'Chinchwad, Maharashtra',
    listedOn: '01 Aug 2024',
    status: 'pending',
    requestedOn: '02 Aug 2024, 04:20 PM',
    message: 'Hello, we can pick up LDPE plastic wraps. Please confirm availability.',
    gradient: 'from-violet-400 to-purple-300',
  },
]

const TABS = [
  { label: 'All Requests', count: 4 },
  { label: 'Pending', count: 2 },
  { label: 'Accepted', count: 1 },
  { label: 'Rejected', count: 1 },
  { label: 'Completed', count: 0 },
]

const STATUS_CONFIG = {
  pending: { color: 'bg-amber-50 text-amber-600 border border-amber-200', icon: Clock, label: 'Pending' },
  accepted: { color: 'bg-emerald-50 text-emerald-600 border border-emerald-200', icon: CheckCircle2, label: 'Accepted' },
  rejected: { color: 'bg-red-50 text-red-500 border border-red-200', icon: XCircle, label: 'Rejected' },
}

export default function Requests() {
  const [activeTab, setActiveTab] = useState('All Requests')
  const [requests, setRequests] = useState(REQUESTS)

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'All Requests') return true
    return r.status === activeTab.toLowerCase()
  })

  const handleAccept = (id) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'accepted', acceptedOn: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) } : r))
    )
  }

  const handleDecline = (id) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected', rejectedOn: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) } : r))
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Requests</h1>
        <p className="mt-1 text-sm text-slate-500">View and manage interest requests from recycling companies.</p>

        {/* Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200">
          {TABS.map(({ label, count }) => {
            const isActive = activeTab === label
            return (
              <button
                key={label}
                onClick={() => setActiveTab(label)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
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

        {/* Request cards */}
        <div className="mt-6 space-y-5">
          {filteredRequests.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <Recycle className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-500">No requests found</p>
            </div>
          )}

          {filteredRequests.map((req) => {
            const st = STATUS_CONFIG[req.status]
            const StatusIcon = st.icon
            return (
              <div key={req.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Top section: 3 columns */}
                <div className="grid gap-0 sm:grid-cols-[1fr_1fr_auto]">
                  {/* Company info */}
                  <div className="border-b border-slate-100 p-5 sm:border-b-0 sm:border-r sm:pr-5">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl ${req.logoBg}`}>
                        {req.logo}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{req.company}</p>
                        {req.verified && (
                          <span className="flex items-center gap-1 text-xs text-brand-600">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-xs text-slate-500">
                      <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-400" /> {req.phone}</p>
                      <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-400" /> {req.email}</p>
                      <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {req.location}</p>
                    </div>
                  </div>

                  {/* Interested in */}
                  <div className="border-b border-slate-100 p-5 sm:border-b-0 sm:border-r sm:pl-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Interested in</p>
                    <div className="mt-3 flex gap-3">
                      <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${req.gradient}`}>
                        <Recycle className="h-7 w-7 text-white" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{req.interestedIn}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <span>{req.quantity}</span>
                          <span>·</span>
                          <span>{req.price}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">{req.listingLocation}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">Listed on {req.listedOn}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex flex-col items-end justify-between p-5">
                    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${st.color}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {st.label}
                    </span>
                    <p className="mt-2 text-right text-[11px] text-slate-400">
                      {req.status === 'pending' && `Requested on ${req.requestedOn}`}
                      {req.status === 'accepted' && `Accepted on ${req.acceptedOn}`}
                      {req.status === 'rejected' && `Rejected on ${req.rejectedOn}`}
                    </p>
                  </div>
                </div>

                {/* Message / Collection / Reason */}
                {req.message && (
                  <div className="mx-5 mb-4 flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <span className="mt-0.5 text-lg">💬</span>
                    <p className="text-sm text-slate-600">{req.message}</p>
                  </div>
                )}

                {req.status === 'accepted' && req.collectionDate && (
                  <div className="mx-5 mb-4 flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-4">
                    <span className="mt-0.5 text-lg">📦</span>
                    <div>
                      <p className="text-sm font-bold text-brand-700">Collection Scheduled</p>
                      <p className="mt-0.5 text-xs text-slate-600">{req.collectionDate} • {req.collectionLocation}</p>
                    </div>
                  </div>
                )}

                {req.status === 'rejected' && req.reason && (
                  <div className="mx-5 mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/60 p-4">
                    <span className="mt-0.5 text-lg">⚠️</span>
                    <div>
                      <p className="text-sm font-bold text-red-600">Reason</p>
                      <p className="mt-0.5 text-xs text-slate-600">{req.reason}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-4">
                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleDecline(req.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 px-4 py-2.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                      >
                        <X className="h-3.5 w-3.5" />
                        Decline
                      </button>
                      <button
                        onClick={() => handleAccept(req.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand-deep px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-brand-deeper"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Accept
                      </button>
                    </>
                  )}
                  {req.status !== 'pending' && (
                    <button className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-700">
                      View Details
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
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
          <button className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-deeper">
            <HeadphonesIcon className="h-4 w-4" />
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}
