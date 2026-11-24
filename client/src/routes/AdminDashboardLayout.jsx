import { useState } from 'react'
import { Outlet } from '@tanstack/react-router'
import AdminSidebar from '../components/admin-dashboard/AdminSidebar'
import AdminTopNavbar from '../components/admin-dashboard/AdminTopNavbar'
import ProtectedRoute from '../components/common/ProtectedRoute'
import { useAuth } from '../context/AuthContext'

export default function AdminDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { seller } = useAuth()

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex h-screen overflow-hidden bg-[#f8faf8]">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminTopNavbar onMenuClick={() => setSidebarOpen(true)} seller={seller} />
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
