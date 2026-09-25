import { useState } from 'react'
import { CheckCircle2, Truck, FileText } from 'lucide-react'

const DEMO_NOTIFS = [
  {
    id: 1,
    title: 'Request Accepted',
    desc: 'Seller Krushna Bhagawat has accepted your buy request for PET Plastic Bottles (100 kg).',
    time: '2 hours ago',
    unread: true,
    icon: CheckCircle2,
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    id: 2,
    title: 'Collection Scheduled',
    desc: 'Pickup for HDPE Containers has been scheduled for 24 Aug 2026 at 11:00 AM.',
    time: 'Yesterday',
    unread: true,
    icon: Truck,
    color: 'text-indigo-600 bg-indigo-50',
  },
  {
    id: 3,
    title: 'New Supply in Pune',
    desc: 'A new lot of LDPE Film & Shrink Wraps (200 kg) has been listed in Chakan MIDC.',
    time: '2 days ago',
    unread: false,
    icon: FileText,
    color: 'text-blue-600 bg-blue-50',
  },
]

export default function BuyerNotifications() {
  const [notifications, setNotifications] = useState(DEMO_NOTIFS)

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  return (
    <div className="min-h-full bg-[#f8faf8] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Notifications</h1>
            <p className="mt-1 text-sm text-slate-500">Live operational alerts regarding listings, offers, and collection appointments.</p>
          </div>
          <button
            onClick={markAllAsRead}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Mark all as read
          </button>
        </div>

        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = n.icon
            return (
              <div
                key={n.id}
                className={`flex items-start gap-4 rounded-2xl border p-4 transition-colors ${
                  n.unread ? 'border-blue-200 bg-white shadow-sm' : 'border-slate-100 bg-slate-50/60'
                }`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${n.color}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                    <span className="text-[11px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{n.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
