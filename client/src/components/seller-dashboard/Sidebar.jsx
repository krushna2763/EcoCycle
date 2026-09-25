import { useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  GitPullRequestArrow,
  MessageSquare,
  FolderOpen,
  Bell,
  User,
  Settings,
  Recycle,
  X,
} from 'lucide-react'
import earthImg from '../../assets/Earth.png'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview', path: '/seller/dashboard' },
  { icon: Package, label: 'My Listings', path: '/seller/dashboard/listings' },
  { icon: PlusCircle, label: 'Add Plastic Waste', path: '/seller/dashboard/add-listing' },
  { icon: GitPullRequestArrow, label: 'Requests', path: '/seller/dashboard/requests', badge: 4 },
  { icon: FolderOpen, label: 'Collections', path: '/seller/dashboard/collections' },
  { icon: MessageSquare, label: 'Messages', path: '/seller/dashboard/messages' },
  { icon: Bell, label: 'Notifications', path: '/seller/dashboard/notifications' },
  { icon: User, label: 'Profile', path: '/seller/dashboard/profile' },
  { icon: Settings, label: 'Settings', path: '/seller/dashboard/settings' },
]

export default function DashboardSidebar({ isOpen, onClose }) {
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
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100">
                <Recycle className="h-5 w-5 text-brand-600" strokeWidth={2.5} />
              </span>
              <span className="text-xl font-bold tracking-tight text-slate-900">EcoCycle</span>
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
            {NAV_ITEMS.map(({ icon: Icon, label, path, badge }) => {
              const isActive = path === '/seller/dashboard' ? location.pathname === path : location.pathname.startsWith(path)
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium
                    transition-all duration-150
                    ${isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} strokeWidth={1.8} />
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-deep px-1.5 text-[10px] font-bold text-white">
                      {badge}
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
              Together we make Earth
            </p>
            <p className="text-center text-xs font-bold text-brand-700">
              Cleaner 🌿
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
