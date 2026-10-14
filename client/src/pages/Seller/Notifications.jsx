import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertCircle,
  Ban,
  Bell,
  Calendar,
  CheckCircle2,
  CheckCheck,
  FileText,
  HeadphonesIcon,
  MessageSquare,
  Settings,
  TrendingUp,
  Truck,
  XCircle,
} from 'lucide-react'
import { useNotificationFeed } from '../../hooks/useNotificationFeed'
import Pagination from '../../components/common/Pagination'
import { timeAgo } from '../../lib/format'

const TABS = [
  { label: 'All', key: 'all', filter: {} },
  { label: 'Unread', key: 'unread', filter: { unread: 'true' } },
  { label: 'Requests', key: 'request', filter: { type: 'request' } },
  { label: 'Collections', key: 'collection', filter: { type: 'collection' } },
  { label: 'Listings', key: 'listing', filter: { type: 'listing' } },
  { label: 'Messages', key: 'message', filter: { type: 'message' } },
]

const ICONS = {
  request_created: { icon: FileText, bg: 'bg-amber-50', color: 'text-amber-600' },
  request_cancelled: { icon: Ban, bg: 'bg-slate-100', color: 'text-slate-500' },
  collection_completed: { icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  collection_cancelled: { icon: XCircle, bg: 'bg-red-50', color: 'text-red-500' },
  collection_scheduled: { icon: Calendar, bg: 'bg-brand-50', color: 'text-brand-600' },
  listing_submitted: { icon: TrendingUp, bg: 'bg-brand-50', color: 'text-brand-600' },
  listing_resubmitted: { icon: TrendingUp, bg: 'bg-brand-50', color: 'text-brand-600' },
  message_received: { icon: MessageSquare, bg: 'bg-blue-50', color: 'text-blue-600' },
}
const TYPE_ICONS = {
  request: { icon: FileText, bg: 'bg-amber-50', color: 'text-amber-600' },
  collection: { icon: Truck, bg: 'bg-brand-50', color: 'text-brand-600' },
  listing: { icon: TrendingUp, bg: 'bg-brand-50', color: 'text-brand-600' },
  message: { icon: MessageSquare, bg: 'bg-blue-50', color: 'text-blue-600' },
  system: { icon: Bell, bg: 'bg-rose-50', color: 'text-rose-500' },
}

const ACTIONS = {
  request: { label: 'View Request', color: 'border-amber-300 text-amber-700 hover:bg-amber-50' },
  collection: { label: 'View Collection', color: 'border-brand-300 text-brand-700 hover:bg-brand-50' },
  listing: { label: 'View Listing', color: 'border-brand-300 text-brand-700 hover:bg-brand-50' },
  message: { label: 'Open Message', color: 'border-blue-300 text-blue-700 hover:bg-blue-50' },
}

export default function Notifications() {
  const [activeTab, setActiveTab] = useState('all')
  const tab = TABS.find((t) => t.key === activeTab)
  const feed = useNotificationFeed(tab.filter)

  const changeTab = (key) => {
    setActiveTab(key)
    feed.setPage(1)
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Notifications</h1>
            <p className="mt-1 text-sm text-slate-500">Stay updated about your listings, requests and collections.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={feed.markAllRead}
              disabled={!feed.counts.unread}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 disabled:opacity-40"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </button>
            <Link
              to="/seller/dashboard/settings"
              aria-label="Notification settings"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              <Settings className="h-4.5 w-4.5" />
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200">
          {TABS.map(({ label, key }) => {
            const isActive = activeTab === key
            return (
              <button
                key={key}
                onClick={() => changeTab(key)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all ${
                  isActive ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
                <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                  isActive ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {feed.counts[key] ?? 0}
                </span>
              </button>
            )
          })}
        </div>

        {(feed.actionError || feed.error) && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {feed.actionError || feed.error}
            {feed.error && <button onClick={feed.reload} className="ml-auto font-semibold underline">Retry</button>}
          </div>
        )}

        {/* Notifications list */}
        <div className="mt-4 space-y-2">
          {feed.loading && (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
            </div>
          )}

          {!feed.loading && !feed.error && feed.notifications.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <Bell className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-500">No notifications found</p>
            </div>
          )}

          {feed.notifications.map((n) => {
            const look = ICONS[n.event] || TYPE_ICONS[n.type] || TYPE_ICONS.system
            const Icon = look.icon
            const action = ACTIONS[n.type]
            const unread = !n.read
            return (
              <div
                key={n._id}
                onClick={() => feed.markRead(n)}
                className={`flex items-start gap-4 rounded-2xl border bg-white p-4 shadow-sm transition-colors hover:shadow-md ${
                  unread ? 'border-brand-200 bg-brand-50/30' : 'border-slate-200'
                }`}
              >
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full ${look.bg}`}>
                    <Icon className={`h-5 w-5 ${look.color}`} />
                  </span>
                  {unread && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-brand-600" />}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{n.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{n.message}</p>
                    </div>
                    <span className="shrink-0 text-[11px] text-slate-400">{timeAgo(n.createdAt)}</span>
                  </div>

                  {/* Action button */}
                  {action && n.link && (
                    <div className="mt-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); feed.open(n) }}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-colors ${action.color}`}
                      >
                        {action.label}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <Pagination page={feed.page} pages={feed.pages} onChange={feed.setPage} />

        {/* Support */}
        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-brand-200 bg-brand-50/50 p-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100">
              <HeadphonesIcon className="h-6 w-6 text-brand-600" strokeWidth={1.8} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Need help with notifications?</h3>
              <p className="mt-0.5 text-xs text-slate-500">Our support team is here to assist you.</p>
            </div>
          </div>
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-deeper">
            <MessageSquare className="h-4 w-4" />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}
