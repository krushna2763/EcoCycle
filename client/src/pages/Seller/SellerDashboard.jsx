import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import DashboardHero from '../../components/seller-dashboard/DashboardHero'
import DashboardStats from '../../components/seller-dashboard/DashboardStats'
import DashboardListings from '../../components/seller-dashboard/DashboardListings'
import DashboardRequests from '../../components/seller-dashboard/DashboardRequests'
import DashboardHelp from '../../components/seller-dashboard/DashboardHelp'

const API_BASE = 'http://localhost:5000/api'

const FALLBACK_STATS = {
  totalListings: 12,
  pending: 4,
  completed: 6,
  totalRecycled: 230,
  activeListings: 8,
}

const FALLBACK_LISTINGS = [
  {
    _id: '1',
    title: 'PET Plastic Bottles',
    plasticType: 'PET',
    quantity: 50,
    pricePerKg: 30,
    location: 'Pune, Maharashtra',
    status: 'approved',
    image: '/listings/pet-bottles.jpg',
    viewCount: 24,
    createdAt: '2024-08-15',
  },
  {
    _id: '2',
    title: 'HDPE Containers',
    plasticType: 'HDPE',
    quantity: 25,
    pricePerKg: 25,
    location: 'Pimpri, Maharashtra',
    status: 'pending',
    image: '/listings/hdpe-containers.jpg',
    viewCount: 10,
    createdAt: '2024-08-18',
  },
  {
    _id: '3',
    title: 'Mixed Plastic',
    plasticType: 'Mixed',
    quantity: 30,
    pricePerKg: 20,
    location: 'Pune, Maharashtra',
    status: 'approved',
    image: '/listings/mixed-plastic.jpg',
    viewCount: 18,
    createdAt: '2024-08-10',
  },
]

const FALLBACK_REQUESTS = [
  {
    _id: '1',
    companyName: 'GreenCycle Pvt. Ltd.',
    interestedPlasticType: 'PET Plastic Bottles',
    quantity: 50,
    location: 'Pune',
    status: 'pending',
  },
  {
    _id: '2',
    companyName: 'Eco Recyclers',
    interestedPlasticType: 'HDPE Containers',
    quantity: 25,
    location: 'Pimpri',
    status: 'accepted',
  },
  {
    _id: '3',
    companyName: 'ReUse Industries',
    interestedPlasticType: 'Mixed Plastic',
    quantity: 30,
    location: 'Pune',
    status: 'rejected',
  },
]

export default function SellerDashboard() {
  const [seller, setSeller] = useState(null)
  const [stats, setStats] = useState(FALLBACK_STATS)
  const [listings, setListings] = useState(FALLBACK_LISTINGS)
  const [requests, setRequests] = useState(FALLBACK_REQUESTS)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('sellerToken')
    const sellerData = localStorage.getItem('sellerData')

    if (!token) {
      navigate({ to: '/login' })
      return
    }

    if (sellerData) {
      try {
        setSeller(JSON.parse(sellerData))
      } catch {
        setSeller({ fullName: 'Seller' })
      }
    }

    const fetchDashboard = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` }

        const meRes = await fetch(`${API_BASE}/auth/me`, { headers })
        if (meRes.ok) {
          const meData = await meRes.json()
          setSeller(meData.seller)
        }

        const statsRes = await fetch(`${API_BASE}/seller/dashboard/stats`, { headers })
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData.stats)
        }

        const listingsRes = await fetch(`${API_BASE}/seller/listings`, { headers })
        if (listingsRes.ok) {
          const listingsData = await listingsRes.json()
          if (listingsData.listings?.length > 0) setListings(listingsData.listings)
        }

        const requestsRes = await fetch(`${API_BASE}/seller/requests`, { headers })
        if (requestsRes.ok) {
          const requestsData = await requestsRes.json()
          if (requestsData.requests?.length > 0) setRequests(requestsData.requests)
        }
      } catch {
        console.log('API not available, using fallback data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [navigate])

  const handleAcceptRequest = async (requestId) => {
    const token = localStorage.getItem('sellerToken')
    try {
      const res = await fetch(`${API_BASE}/seller/requests/${requestId}/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (r._id === requestId ? { ...r, status: 'accepted' } : r))
        )
      }
    } catch {
      setRequests((prev) =>
        prev.map((r) => (r._id === requestId ? { ...r, status: 'accepted' } : r))
      )
    }
  }

  const handleRejectRequest = async (requestId) => {
    const token = localStorage.getItem('sellerToken')
    try {
      const res = await fetch(`${API_BASE}/seller/requests/${requestId}/reject`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (r._id === requestId ? { ...r, status: 'rejected' } : r))
        )
      }
    } catch {
      setRequests((prev) =>
        prev.map((r) => (r._id === requestId ? { ...r, status: 'rejected' } : r))
      )
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <DashboardHero sellerName={seller?.fullName} />
        <DashboardStats stats={stats} />
        <DashboardListings listings={listings} />
        <DashboardRequests
          requests={requests}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
        />
        <DashboardHelp />
      </div>
    </div>
  )
}
