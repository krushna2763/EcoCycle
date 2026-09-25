import { useState } from 'react'
import { Outlet } from '@tanstack/react-router'
import DashboardSidebar from '../components/seller-dashboard/Sidebar'
import DashboardTopNavbar from '../components/seller-dashboard/TopNavbar'
import ProtectedRoute from '../components/common/ProtectedRoute'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const seller = JSON.parse(localStorage.getItem('sellerData') || '{}')

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-[#f8faf8]">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardTopNavbar onMenuClick={() => setSidebarOpen(true)} seller={seller} />
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
