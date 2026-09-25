import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Search, MapPin, Filter, Package } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const DEMO_LISTINGS = [
  { _id: 'demo1', title: 'PET Plastic Bottles', plasticType: 'PET', quantity: 50, pricePerKg: 30, location: 'Pune, Maharashtra', condition: 'Clean', description: 'Clean used PET bottles collected from local shops.', seller: { fullName: 'Krushna Bhagawat', city: 'Pune' }, status: 'approved' },
  { _id: 'demo2', title: 'HDPE Containers', plasticType: 'HDPE', quantity: 25, pricePerKg: 25, location: 'Pimpri, Maharashtra', condition: 'Used', description: 'Used HDPE containers, good condition suitable for recycling.', seller: { fullName: 'Eco Collectors', city: 'Pimpri' }, status: 'approved' },
  { _id: 'demo3', title: 'Mixed Plastic Waste', plasticType: 'Mixed', quantity: 30, pricePerKg: 20, location: 'Pune, Maharashtra', condition: 'Mixed', description: 'Mixed plastic waste including bottles and wrappers.', seller: { fullName: 'Green Roots', city: 'Pune' }, status: 'approved' },
  { _id: 'demo4', title: 'LDPE Plastic Wraps', plasticType: 'LDPE', quantity: 10, pricePerKg: 12, location: 'Chinchwad, Maharashtra', condition: 'Clean', description: 'Clean LDPE plastic wraps and packaging material.', seller: { fullName: 'Swachh Solutions', city: 'Chinchwad' }, status: 'approved' },
  { _id: 'demo5', title: 'PP Plastic Cups', plasticType: 'PP', quantity: 15, pricePerKg: 18, location: 'Nigdi, Maharashtra', condition: 'Used', description: 'Used PP plastic cups sorted and washed.', seller: { fullName: 'Recycle Hub', city: 'Nigdi' }, status: 'approved' },
  { _id: 'demo6', title: 'HDPE Crates', plasticType: 'HDPE', quantity: 40, pricePerKg: 28, location: 'Hinjewadi, Maharashtra', condition: 'Broken', description: 'Broken HDPE crates in good recyclable condition.', seller: { fullName: 'PureCycle', city: 'Hinjewadi' }, status: 'approved' },
]

const PLASTIC_TYPES = ['All', 'PET', 'HDPE', 'LDPE', 'PP', 'PVC', 'Mixed', 'PS']

export default function BrowseListings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [plasticType, setPlasticType] = useState('All')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    const fetchListings = async () => {
      const token = localStorage.getItem('sellerToken')
      try {
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        if (plasticType !== 'All') params.set('plasticType', plasticType)
        if (sortBy !== 'newest') params.set('sort', sortBy)
        const headers = token ? { Authorization: 'Bearer ' + token } : {}
        const res = await fetch(`${API_BASE}/buyer/listings?${params.toString()}`, { headers })
        if (res.ok) {
          const data = await res.json()
          setListings(data.listings || [])
        } else {
          setListings(DEMO_LISTINGS)
        }
      } catch {
        setListings(DEMO_LISTINGS)
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [search, plasticType, sortBy])

  const filtered = listings.filter((l) => {
    if (plasticType !== 'All' && l.plasticType !== plasticType) return false
    if (search) {
      const s = search.toLowerCase()
      return (
        (l.title || '').toLowerCase().includes(s) ||
        (l.location || '').toLowerCase().includes(s) ||
        (l.plasticType || '').toLowerCase().includes(s)
      )
    }
    return true
  })

  return (
    <div className="min-h-full bg-[#f8faf8] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Browse Listings</h1>
          <p className="mt-1 text-sm text-slate-500">Discover verified plastic waste listings from trusted sellers.</p>
        </div>

        {/* Search + sort */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, plastic type or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="quantity_desc">Quantity: High to Low</option>
            </select>
          </div>
        </div>

        {/* Plastic type chips */}
        <div className="flex flex-wrap gap-2">
          {PLASTIC_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setPlasticType(type)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                plasticType === type
                  ? 'border border-blue-300 bg-blue-50 text-blue-700'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Listing grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Package className="h-12 w-12 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-600">No listings found</p>
            <p className="mt-1 text-xs text-slate-400">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((listing) => (
              <Link
                key={listing._id}
                to="/buyer/dashboard/listings/$id"
                params={{ id: listing._id }}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                    {listing.plasticType}
                  </span>
                </div>

                <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-blue-700">
                  {listing.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">{listing.description}</p>

                <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {listing.location}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div>
                    <p className="text-lg font-extrabold text-blue-700">₹{listing.pricePerKg}<span className="text-xs font-semibold text-slate-500">/kg</span></p>
                    <p className="text-[11px] text-slate-400">{listing.quantity} kg available</p>
                  </div>
                  <span className="rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors group-hover:bg-blue-600">
                    View Details
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}