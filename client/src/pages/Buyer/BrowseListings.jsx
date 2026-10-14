import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Search, MapPin, Filter, Package } from 'lucide-react'
import api, { assetUrl } from '../../services/api'
import { useApi } from '../../hooks/useApi'
import Pagination from '../../components/common/Pagination'

const PLASTIC_TYPES = ['All', 'PET', 'HDPE', 'LDPE', 'PP', 'PVC', 'Mixed', 'PS']
const PAGE_SIZE = 12

export default function BrowseListings() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [plasticType, setPlasticType] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(1)

  // Wait for a pause in typing before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data, loading, error, reload } = useApi(
    () => api.getMarketplaceListings({
      search,
      plasticType: plasticType === 'All' ? undefined : plasticType,
      sort: sortBy === 'newest' ? undefined : sortBy,
      page,
      limit: PAGE_SIZE,
    }),
    [search, plasticType, sortBy, page]
  )
  const listings = data?.listings || []

  return (
    <div className="min-h-full bg-[#f8faf8] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Browse Listings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Discover available plastic waste listings from sellers.
            {data && !loading && ` ${data.total} listing${data.total === 1 ? '' : 's'} found.`}
          </p>
        </div>

        {/* Search + sort */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, plastic type or location..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
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
              onClick={() => { setPlasticType(type); setPage(1) }}
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
        {loading && !data ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 py-12 text-center">
            <p className="text-sm font-semibold text-red-600">{error}</p>
            <button onClick={reload} className="mt-3 rounded-xl border border-red-300 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100">
              Try again
            </button>
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Package className="h-12 w-12 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-600">No listings found</p>
            <p className="mt-1 text-xs text-slate-400">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
            {listings.map((listing) => {
              const cover = assetUrl(listing.image)
              return (
                <Link
                  key={listing._id}
                  to="/buyer/dashboard/listings/$id"
                  params={{ id: listing._id }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                >
                  {cover && <img src={cover} alt={listing.title} className="h-40 w-full object-cover" />}
                  <div className="flex flex-1 flex-col p-5">
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

                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                      <div>
                        <p className="text-lg font-extrabold text-blue-700">₹{listing.pricePerKg}<span className="text-xs font-semibold text-slate-500">/kg</span></p>
                        <p className="text-[11px] text-slate-400">{listing.quantity} kg available</p>
                      </div>
                      <span className="rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors group-hover:bg-blue-600">
                        View Details
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {data && <Pagination page={page} pages={data.pages} onChange={setPage} accent="blue" />}
      </div>
    </div>
  )
}
