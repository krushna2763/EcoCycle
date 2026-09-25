import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  MoreVertical,
  PlusCircle,
  Recycle,
  Tag,
} from 'lucide-react'

const LISTINGS = [
  {
    id: 1,
    title: 'PET Plastic Bottles',
    plasticType: 'PET',
    quantity: 50,
    pricePerKg: 30,
    location: 'Pune, Maharashtra',
    description: 'Clean used PET bottles collected from local shop.',
    date: '15 Aug 2024',
    views: 24,
    status: 'approved',
    color: 'from-blue-400 to-cyan-300',
    emoji: '🧴',
  },
  {
    id: 2,
    title: 'HDPE Containers',
    plasticType: 'HDPE',
    quantity: 25,
    pricePerKg: 25,
    location: 'Pimpri, Maharashtra',
    description: 'Used HDPE containers, good condition suitable for recycling.',
    date: '18 Aug 2024',
    views: 10,
    status: 'pending',
    color: 'from-amber-300 to-orange-300',
    emoji: '🫙',
  },
  {
    id: 3,
    title: 'Mixed Plastic',
    plasticType: 'Mixed',
    quantity: 30,
    pricePerKg: 20,
    location: 'Pune, Maharashtra',
    description: 'Mixed plastic waste including bottles and wrappers.',
    date: '10 Aug 2024',
    views: 18,
    status: 'approved',
    color: 'from-emerald-400 to-teal-300',
    emoji: '♻️',
  },
  {
    id: 4,
    title: 'PP Plastic Cups',
    plasticType: 'PP',
    quantity: 15,
    pricePerKg: 18,
    location: 'Pune, Maharashtra',
    description: 'Used PP plastic cups from tea stall.',
    date: '05 Aug 2024',
    views: 12,
    status: 'rejected',
    color: 'from-rose-400 to-pink-300',
    emoji: '🥤',
  },
  {
    id: 5,
    title: 'LDPE Plastic Wraps',
    plasticType: 'LDPE',
    quantity: 10,
    pricePerKg: 12,
    location: 'Chinchwad, Maharashtra',
    description: 'Clean LDPE plastic wraps and packaging material.',
    date: '01 Aug 2024',
    views: 8,
    status: 'pending',
    color: 'from-violet-400 to-purple-300',
    emoji: '📦',
  },
  {
    id: 6,
    title: 'HDPE Crates',
    plasticType: 'HDPE',
    quantity: 40,
    pricePerKg: 28,
    location: 'Pune, Maharashtra',
    description: 'Broken HDPE crates in good recyclable condition.',
    date: '28 Jul 2024',
    views: 16,
    status: 'approved',
    color: 'from-sky-400 to-blue-300',
    emoji: '📦',
  },
]

const STATUS_STYLES = {
  approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  rejected: 'bg-red-50 text-red-600 border border-red-200',
  completed: 'bg-slate-50 text-slate-600 border border-slate-200',
}

const FILTER_TABS = [
  { label: 'All', count: 12 },
  { label: 'Approved', count: 6 },
  { label: 'Pending', count: 4 },
  { label: 'Rejected', count: 2 },
  { label: 'Completed', count: 0 },
]

function ListingCard({ listing }) {
  const statusKey = listing.status === 'approved' ? 'approved' : listing.status === 'pending' ? 'pending' : listing.status === 'rejected' ? 'rejected' : 'completed'

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md sm:flex-row">
      {/* Image area */}
      <div className={`relative flex h-64 shrink-0 items-center justify-center bg-gradient-to-br ${listing.color} sm:h-auto sm:w-72`}>
        <span className="text-6xl">{listing.emoji}</span>
        <span className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm">
          {listing.plasticType}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Top row: title + status + menu */}
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-slate-900">{listing.title}</h3>
          <div className="flex items-center gap-2">
            <span className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[statusKey]}`}>
              {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
            </span>
            <button className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Info row with separators */}
        <div className="mt-3 flex flex-wrap items-center text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Recycle className="h-3.5 w-3.5 text-brand-500" />
            {listing.plasticType}
          </span>
          <span className="mx-3 text-slate-300">|</span>
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            {listing.quantity} kg
          </span>
          <span className="mx-3 text-slate-300">|</span>
          <span className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-slate-400" />
            ₹{listing.pricePerKg} / kg
          </span>
        </div>

        {/* Location */}
        <p className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          {listing.location}
        </p>

        {/* Description */}
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{listing.description}</p>

        {/* Bottom row: date, views, buttons */}
        <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              {listing.date}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {listing.views} views
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-700">
              View Details
            </button>
            <button className="rounded-xl bg-brand-deep px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-deeper">
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Weight(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="5" r="3"/><path d="M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.23A2 2 0 0 0 4 21h16a2 2 0 0 0 1.9-2.77l-2.5-8.77A2 2 0 0 0 17.5 8z"/>
    </svg>
  )
}

export default function MyListings() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [sortBy, setSortBy] = useState('Newest')

  const filteredListings = LISTINGS.filter((listing) => {
    if (activeFilter === 'All') return true
    return listing.status === activeFilter.toLowerCase()
  })

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/seller/dashboard" className="transition-colors hover:text-brand-600">Home</Link>
          <span className="text-slate-300">›</span>
          <span className="font-medium text-slate-700">My Listings</span>
        </nav>

        {/* Header */}
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">My Listings</h1>
            <p className="mt-1 text-sm text-slate-500">Manage all your plastic waste listings in one place.</p>
          </div>
          <Link
            to="/seller/dashboard/add-listing"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-deeper"
          >
            <PlusCircle className="h-4 w-4" />
            Add Plastic Waste
          </Link>
        </div>

        {/* Filter bar */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTER_TABS.map(({ label, count }) => {
              const isActive = activeFilter === label
              return (
                <button
                  key={label}
                  onClick={() => setActiveFilter(label)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'border border-brand-300 bg-brand-50 text-brand-700'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800'
                  }`}
                >
                  {label} ({count})
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-brand-400"
            >
              <option>Newest</option>
              <option>Oldest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Listing cards */}
        <div className="mt-6 space-y-4">
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-deep text-sm font-semibold text-white">
            1
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
            2
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
            3
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
