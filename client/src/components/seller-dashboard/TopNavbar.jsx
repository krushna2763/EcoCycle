import { Menu, Bell, ChevronDown, LogOut } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'

export default function DashboardTopNavbar({ onMenuClick, seller }) {
  const [showProfile, setShowProfile] = useState(false)
  const profileRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('sellerToken')
    localStorage.removeItem('sellerData')
    navigate({ to: '/login' })
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* Menu toggle */}
      <button
        onClick={onMenuClick}
        className="mr-3 rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      {/* Notification bell */}
      <button className="relative mr-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100">
        <Bell className="h-5 w-5" strokeWidth={1.8} />
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-deep px-1 text-[10px] font-bold text-white">
          3
        </span>
      </button>

      {/* Profile */}
      <div ref={profileRef} className="relative">
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 transition-colors hover:bg-slate-50"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
            {seller?.fullName?.charAt(0) || 'S'}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-slate-900">
              {seller?.fullName || 'Seller'}
            </p>
            <p className="text-[11px] font-medium text-slate-500">Seller</p>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
        </button>

        {showProfile && (
          <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4 text-slate-400" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
