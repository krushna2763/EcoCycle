import { Menu, ChevronDown, LogOut, Shield } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../context/AuthContext'
import { assetUrl } from '../../services/api'

export default function AdminTopNavbar({ onMenuClick, seller }) {
  const [showProfile, setShowProfile] = useState(false)
  const profileRef = useRef(null)
  const navigate = useNavigate()
  const { logout } = useAuth()
  const avatar = assetUrl(seller?.avatar)

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
    logout()
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

      {/* Title */}
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <Shield className="h-4 w-4" />
        </span>
        <h1 className="text-base font-semibold text-slate-800">Admin Control Center</h1>
      </div>

      <div className="flex-1" />

      {/* Profile */}
      <div ref={profileRef} className="relative">
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-slate-50"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="h-full w-full rounded-full object-cover" />
            ) : (
              (seller?.fullName?.[0] || 'A').toUpperCase()
            )}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-slate-800">{seller?.fullName || 'Administrator'}</p>
            <p className="text-xs font-medium text-emerald-600">Super Admin</p>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
        </button>

        {showProfile && (
          <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
            <div className="border-b border-slate-100 px-4 py-2">
              <p className="text-xs font-medium text-slate-400">Signed in as</p>
              <p className="truncate text-sm font-semibold text-slate-800">{seller?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
