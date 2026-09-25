import { useState } from 'react'
import { Outlet } from '@tanstack/react-router'
import BuyerSidebar from '../components/buyer-dashboard/BuyerSidebar'
import BuyerTopNavbar from '../components/buyer-dashboard/BuyerTopNavbar'
import ProtectedRoute from '../components/common/ProtectedRoute'

export default function BuyerDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const buyer = JSON.parse(localStorage.getItem('sellerData') || '{}')

  return (
    <ProtectedRoute requiredRole="buyer">
      <div className="flex h-screen overflow-hidden bg-[#f8faf8]">
        <BuyerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <BuyerTopNavbar onMenuClick={() => setSidebarOpen(true)} buyer={buyer} />
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}