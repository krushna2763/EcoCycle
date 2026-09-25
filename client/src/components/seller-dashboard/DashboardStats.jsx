import { Package, Clock, CheckCircle2, Recycle } from 'lucide-react'

const STAT_CONFIG = [
  {
    key: 'totalListings',
    label: 'Total Listings',
    sub: (s) => `Active ${s.activeListings || 0}`,
    icon: Package,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    key: 'pending',
    label: 'Pending',
    sub: () => 'Approval',
    icon: Clock,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    key: 'completed',
    label: 'Completed',
    sub: () => 'This Month',
    icon: CheckCircle2,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    key: 'totalRecycled',
    label: 'Total Recycled',
    sub: () => 'This Month',
    icon: Recycle,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    suffix: ' kg',
  },
]

export default function DashboardStats({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {STAT_CONFIG.map(({ key, label, sub, icon: Icon, iconBg, iconColor, suffix }) => (
        <div
          key={key}
          className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="text-2xl font-extrabold text-slate-900">
              {stats?.[key] ?? 0}{suffix || ''}
            </p>
            <p className="text-[11px] text-slate-400">{sub(stats || {})}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
