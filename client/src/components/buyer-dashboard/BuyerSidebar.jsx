import { Link, useLocation } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Store,
  FileText,
  Truck,
  MessageSquare,
  Bell,
  User,
  Settings,
  X,
  ShoppingCart,
} from 'lucide-react'
import earthImg from '../../assets/Earth.png'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview', path: '/buyer/dashboard' },
  { icon: Store, label: 'Browse Listings', path: '/buyer/dashboard/listings' },
  { icon: FileText, label: 'My Requests', path: '/buyer/dashboard/requests' },
  { icon: Truck, label: 'Collections', path: '/buyer/dashboard/collections' },
  { icon: MessageSquare, label: 'Messages', path: '/buyer/dashboard/messages' },
  { icon: Bell, label: 'Notifications', path: '/buyer/dashboard/notifications' },
  { icon: User, label: 'Profile', path: '/buyer/dashboard/profile' },
  { icon: Settings, label: 'Settings', path: '/buyer/dashboard/settings' },
]

export default function BuyerDashboardSidebar({ isOpen, onClose }) {
  const location = useLocation()

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
          {/* Logo */}
          <div className="flex items-center justify-between px-5 py-5">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                <ShoppingCart className="h-5 w-5 text-blue-600" strokeWidth={2.2} />
              </span>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 leading-tight">EcoCycle</span>
                <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Buyer Hub</span>
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
            {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
              const isActive = path === '/buyer/dashboard' ? location.pathname === path : location.pathname.startsWith(path)
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium
                    transition-all duration-150
                    ${isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} strokeWidth={1.8} />
                  <span className="flex-1">{label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Promo card */}
          <div className="mx-3 mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 border border-blue-100">
            <div className="flex justify-center">
              <img src={earthImg} alt="Earth" className="h-20 w-20 object-contain" />
            </div>
            <p className="mt-2 text-center text-xs font-semibold text-slate-800">
              Procuring sustainable plastics
            </p>
            <p className="text-center text-xs font-bold text-blue-700">
              Circularity in Action 🔄
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}