import { Link, useLocation } from '@tanstack/react-router'
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  ShieldCheck,
  Recycle,
  X,
} from 'lucide-react'
import earthImg from '../../assets/Earth.png'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
  { icon: ClipboardList, label: 'Pending Listings', path: '/admin/dashboard/listings', showBadge: true },
  { icon: Users, label: 'All Users', path: '/admin/dashboard/users' },
]

export default function AdminSidebar({ isOpen, onClose }) {
  const location = useLocation()

  const { data: statsData } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => api.getAdminStats(),
    staleTime: 30000,
  })

  const pendingCount = statsData?.stats?.pendingListings || 0

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 border-r border-slate-200 bg-white
          transition-transform duration-300
          lg:sticky lg:top-0 lg:translate-x-0 lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-full flex-col">
          {/* Logo & Admin Badge */}
          <div className="flex items-center justify-between px-5 py-5">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100">
                <Recycle className="h-5 w-5 text-brand-600" strokeWidth={2.5} />
              </span>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900">EcoCycle</span>
                <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                  <ShieldCheck className="h-3 w-3" /> Admin
                </span>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 space-y-1 px-3 py-2">
            {NAV_ITEMS.map(({ icon: Icon, label, path, showBadge }) => {
              const isActive = path === '/admin/dashboard'
                ? location.pathname === path
                : location.pathname.startsWith(path)
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium
                    transition-all duration-150
                    ${isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} strokeWidth={1.8} />
                  <span className="flex-1">{label}</span>
                  {showBadge && pendingCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Promo card */}
          <div className="mx-3 mb-4 rounded-2xl bg-gradient-to-br from-brand-50 to-emerald-50 p-4">
            <div className="flex justify-center">
              <img src={earthImg} alt="Earth" className="h-20 w-20 object-contain" />
            </div>
            <p className="mt-2 text-center text-xs font-semibold text-slate-800">
              Platform Administration
            </p>
            <p className="text-center text-xs font-bold text-brand-700">
              Clean Earth, Better Tomorrow 🌿
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
