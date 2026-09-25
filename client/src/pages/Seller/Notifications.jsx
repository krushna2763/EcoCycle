import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Bell,
  Calendar,
  CheckCircle2,
  CheckCheck,
  ChevronDown,
  FileText,
  HeadphonesIcon,
  MessageSquare,
  Package,
  Settings,
  Star,
  TrendingUp,
  Truck,
} from 'lucide-react'

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'collection',
    icon: <Truck className="h-5 w-5 text-brand-600" />,
    iconBg: 'bg-brand-50',
    title: 'Collection scheduled',
    desc: 'Your HDPE Containers collection has been scheduled with Eco Recyclers.',
    time: '10:30 AM',
    date: '21 Aug 2026',
    pickupTime: '02:00 PM',
    action: 'View Collection',
    actionColor: 'border-brand-300 text-brand-700 hover:bg-brand-50',
    unread: true,
  },
  {
    id: 2,
    type: 'request',
    icon: <FileText className="h-5 w-5 text-amber-600" />,
    iconBg: 'bg-amber-50',
    title: 'New collection request',
    desc: 'GreenCycle Pvt. Ltd. is interested in your PET Plastic Bottles.',
    time: '10:30 AM',
    quantity: '50 kg',
    price: '₹30/kg',
    action: 'View Request',
    actionColor: 'border-amber-300 text-amber-700 hover:bg-amber-50',
    unread: true,
  },
  {
    id: 3,
    type: 'message',
    icon: <MessageSquare className="h-5 w-5 text-blue-600" />,
    iconBg: 'bg-blue-50',
    title: 'New message from GreenCycle Pvt. Ltd.',
    desc: 'Yes, we can collect it on 22 Aug at 11:00 AM.',
    time: '10:20 AM',
    action: 'Open Message',
    actionColor: 'border-blue-300 text-blue-700 hover:bg-blue-50',
    unread: true,
  },
  {
    id: 4,
    type: 'collection',
    icon: <Calendar className="h-5 w-5 text-brand-600" />,
    iconBg: 'bg-brand-50',
    title: 'Collection reminder',
    desc: 'Your collection for Mixed Plastic is scheduled tomorrow.',
    time: 'Yesterday, 06:30 PM',
    date: '22 Aug 2026',
    pickupTime: '09:45 AM',
    unread: false,
  },
  {
    id: 5,
    type: 'collection',
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
    iconBg: 'bg-emerald-50',
    title: 'Collection completed',
    desc: 'Your LDPE Plastic Wraps collection has been completed.',
    time: '21 Aug 2026, 04:40 PM',
    quantity: '10 kg',
    action: 'View Details',
    actionColor: 'border-emerald-300 text-emerald-700 hover:bg-emerald-50',
    unread: false,
  },
  {
    id: 6,
    type: 'request',
    icon: <Star className="h-5 w-5 text-amber-500" />,
    iconBg: 'bg-amber-50',
    title: 'Request accepted',
    desc: 'Eco Recyclers has accepted your HDPE Containers request.',
    time: '20 Aug 2026, 11:15 AM',
    quantity: '25 kg',
    price: '₹25/kg',
    action: 'View Request',
    actionColor: 'border-amber-300 text-amber-700 hover:bg-amber-50',
    unread: false,
  },
  {
    id: 7,
    type: 'listing',
    icon: <TrendingUp className="h-5 w-5 text-brand-600" />,
    iconBg: 'bg-brand-50',
    title: 'New listing is live',
    desc: 'Your PET Plastic Bottles listing is now live and visible to recyclers.',
    time: '19 Aug 2026, 09:10 AM',
    action: 'View Listing',
    actionColor: 'border-brand-300 text-brand-700 hover:bg-brand-50',
    unread: false,
  },
  {
    id: 8,
    type: 'system',
    icon: <Bell className="h-5 w-5 text-rose-500" />,
    iconBg: 'bg-rose-50',
    title: 'System update',
    desc: 'EcoCycle will be undergoing maintenance on 24 Aug 2026 from 12:00 AM to 02:00 AM.',
    time: '18 Aug 2026, 05:00 PM',
    unread: false,
  },
]

const TABS = [
  { label: 'All', count: 8 },
  { label: 'Unread', count: 3 },
  { label: 'Requests', count: 2 },
  { label: 'Collections', count: 3 },
  { label: 'Listings', count: 1 },
  { label: 'Messages', count: 2 },
]

export default function Notifications() {
  const [activeTab, setActiveTab] = useState('All')
  const [notifications, setNotifications] = useState(NOTIFICATIONS)

  const filtered = notifications.filter((n) => {
    if (activeTab === 'All') return true
    if (activeTab === 'Unread') return n.unread
    if (activeTab === 'Requests') return n.type === 'request'
    if (activeTab === 'Collections') return n.type === 'collection'
    if (activeTab === 'Listings') return n.type === 'listing'
    if (activeTab === 'Messages') return n.type === 'message'
    return true
  })

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
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
            <button onClick={markAllRead} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800">
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50">
              <Settings className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200">
          {TABS.map(({ label, count }) => {
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

        {/* Notifications list */}
        <div className="mt-4 space-y-2">
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <Bell className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-500">No notifications found</p>
            </div>
          )}

          {filtered.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 rounded-2xl border bg-white p-4 shadow-sm transition-colors hover:shadow-md ${
                n.unread ? 'border-brand-200 bg-brand-50/30' : 'border-slate-200'
              }`}
            >
              {/* Unread dot */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                {n.unread ? (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50">
                    {n.icon}
                  </span>
                ) : (
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full ${n.iconBg}`}>
                    {n.icon}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{n.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{n.desc}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-slate-400">{n.time}</span>
                </div>

                {/* Meta info */}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                  {n.date && (
                    <span className="flex items-center gap-1 text-brand-600 font-medium">
                      <Calendar className="h-3 w-3" /> {n.date}
                      {n.pickupTime && <span>• {n.pickupTime}</span>}
                    </span>
                  )}
                  {n.quantity && (
                    <span className="flex items-center gap-1 text-slate-600">
                      {n.quantity}
                      {n.price && <span>• <span className="text-brand-600 font-medium">{n.price}</span></span>}
                    </span>
                  )}
                </div>

                {/* Action button */}
                {n.action && (
                  <div className="mt-3">
                    <button className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-colors ${n.actionColor}`}>
                      {n.action}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

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
          <button className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-deeper">
            <MessageSquare className="h-4 w-4" />
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}
