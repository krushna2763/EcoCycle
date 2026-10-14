import { AlertCircle, Ban, Bell, Calendar, CheckCircle2, MessageSquare, Truck, FileText, XCircle } from 'lucide-react'
import { useNotificationFeed } from '../../hooks/useNotificationFeed'
import Pagination from '../../components/common/Pagination'
import { timeAgo } from '../../lib/format'

const EVENT_STYLES = {
  request_accepted: { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
  request_rejected: { icon: XCircle, color: 'text-red-500 bg-red-50' },
  collection_scheduled: { icon: Calendar, color: 'text-indigo-600 bg-indigo-50' },
  collection_rescheduled: { icon: Calendar, color: 'text-indigo-600 bg-indigo-50' },
  collection_in_progress: { icon: Truck, color: 'text-indigo-600 bg-indigo-50' },
  collection_completed: { icon: CheckCircle2, color: 'text-teal-600 bg-teal-50' },
  collection_cancelled: { icon: Ban, color: 'text-slate-500 bg-slate-100' },
  message_received: { icon: MessageSquare, color: 'text-blue-600 bg-blue-50' },
}
const DEFAULT_STYLE = { icon: FileText, color: 'text-blue-600 bg-blue-50' }

export default function BuyerNotifications() {
  const feed = useNotificationFeed({})

  return (
    <div className="min-h-full bg-[#f8faf8] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Notifications</h1>
            <p className="mt-1 text-sm text-slate-500">Updates about your requests, collection appointments and messages.</p>
          </div>
          <button
            onClick={feed.markAllRead}
            disabled={!feed.counts.unread}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Mark all as read{feed.counts.unread ? ` (${feed.counts.unread})` : ''}
          </button>
        </div>

        {(feed.actionError || feed.error) && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {feed.actionError || feed.error}
            {feed.error && <button onClick={feed.reload} className="ml-auto underline">Retry</button>}
          </div>
        )}

        {feed.loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : !feed.error && feed.notifications.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Bell className="h-12 w-12 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-600">No notifications yet</p>
            <p className="mt-1 text-xs text-slate-400">Seller responses and pickup updates will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {feed.notifications.map((n) => {
              const { icon: Icon, color } = EVENT_STYLES[n.event] || DEFAULT_STYLE
              return (
                <button
                  key={n._id}
                  onClick={() => feed.open(n)}
                  className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-colors ${
                    !n.read ? 'border-blue-200 bg-white shadow-sm' : 'border-slate-100 bg-slate-50/60'
                  }`}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                      <span className="shrink-0 text-[11px] text-slate-400">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">{n.message}</p>
                  </div>
                  {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
                </button>
              )
            })}
          </div>
        )}

        <Pagination page={feed.page} pages={feed.pages} onChange={feed.setPage} accent="blue" />
      </div>
    </div>
  )
}
