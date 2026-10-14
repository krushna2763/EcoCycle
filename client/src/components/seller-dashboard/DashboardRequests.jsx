import { Link } from '@tanstack/react-router'
import { Package, MapPin } from 'lucide-react'
import { statusLabel } from '../../lib/format'

const STATUS_STYLES = {
  pending: 'text-amber-600',
  accepted: 'text-emerald-600',
  scheduled: 'text-blue-600',
  in_progress: 'text-indigo-600',
  completed: 'text-teal-600',
  rejected: 'text-red-500',
  cancelled: 'text-slate-500',
}

const COMPANY_COLORS = [
  'bg-emerald-500',
  'bg-brand-500',
  'bg-blue-500',
]

export default function DashboardRequests({ requests, onAccept, onReject, actingId }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Recent Requests</h2>
        <Link to="/seller/dashboard/requests" className="flex items-center gap-1 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700">
          View All
          <span className="text-lg">→</span>
        </Link>
      </div>

      {requests.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
          No requests yet. Buyers' requests for your approved listings will appear here.
        </p>
      )}

      {/* Request rows */}
      <div className="space-y-3">
        {requests.map((req, idx) => {
          const busy = actingId === req._id
          return (
            <div
              key={req._id}
              className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Left: Company info */}
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${COMPANY_COLORS[idx % COMPANY_COLORS.length]}`}>
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{req.companyName}</p>
                  <p className="text-xs text-slate-500">Interested in {req.listing?.title || req.interestedPlasticType}</p>
                </div>
              </div>

              {/* Middle: Details */}
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5 text-slate-400" />
                  {req.quantity} kg
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {req.location}
                </span>
              </div>

              {/* Right: Status / Actions */}
              <div className="flex items-center gap-3">
                <span className={`text-sm font-semibold ${STATUS_STYLES[req.status] || 'text-slate-500'}`}>
                  {statusLabel(req.status)}
                </span>

                {req.status === 'pending' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onReject?.(req._id)}
                      disabled={busy}
                      className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => onAccept?.(req._id)}
                      disabled={busy}
                      className="rounded-lg bg-brand-deep px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-deeper disabled:opacity-50"
                    >
                      {busy ? '...' : 'Accept'}
                    </button>
                  </div>
                ) : (
                  <Link
                    to={['accepted', 'scheduled', 'in_progress', 'completed'].includes(req.status) ? '/seller/dashboard/collections' : '/seller/dashboard/requests'}
                    className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                  >
                    View Details
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
