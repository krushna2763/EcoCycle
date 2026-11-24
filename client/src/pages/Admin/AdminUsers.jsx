import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  Store,
  Building2,
  ShieldCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Mail,
  Phone,
  CheckCircle,
} from 'lucide-react'
import api from '../../services/api'

export default function AdminUsers() {
  const [roleFilter, setRoleFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const limit = 15

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminUsers', { role: roleFilter === 'all' ? undefined : roleFilter, page, limit }],
    queryFn: () => api.getAdminUsers({ role: roleFilter === 'all' ? undefined : roleFilter, page, limit }),
  })

  const users = data?.users || []
  const counts = data?.counts || { all: 0, sellers: 0, buyers: 0, admins: 0 }
  const total = data?.total || 0
  const totalPages = data?.totalPages || 1

  const filteredUsers = searchTerm
    ? users.filter((u) => {
        const query = searchTerm.toLowerCase()
        return (
          u.fullName?.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query) ||
          u.city?.toLowerCase().includes(query) ||
          u.businessName?.toLowerCase().includes(query)
        )
      })
    : users

  const TABS = [
    { key: 'all', label: 'All Users', count: counts.all, icon: Users },
    { key: 'seller', label: 'Sellers', count: counts.sellers, icon: Store },
    { key: 'buyer', label: 'Buyers', count: counts.buyers, icon: Building2 },
    { key: 'admin', label: 'Admins', count: counts.admins, icon: ShieldCheck },
  ]

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
            <Users className="h-4 w-4" /> User Management
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Registered Platform Users
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            View accounts, role assignments, and verification statuses across EcoCycle.
          </p>
        </div>
        <div className="text-sm font-semibold text-slate-600">
          Total: <strong className="text-slate-900">{total}</strong> Users
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 sm:border-0 sm:pb-0">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isSelected = roleFilter === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setRoleFilter(tab.key)
                  setPage(1)
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count ?? 0}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, email, city..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-2 text-sm font-semibold text-slate-700">No users found</p>
            <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Type / Organization</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Joined</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-xs">
                          {(user.fullName?.[0] || 'U').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{user.fullName}</p>
                          <p className="text-xs text-slate-400">ID: {user._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{user.phone || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold capitalize ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'buyer'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {user.role || 'seller'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      {user.businessName ? (
                        <div>
                          <strong className="text-slate-800">{user.businessName}</strong>
                          <p className="text-slate-400 capitalize">{user.sellerType || 'Business'}</p>
                        </div>
                      ) : (
                        <span className="capitalize">{user.sellerType || 'Individual'}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span>{user.city || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          user.verificationStatus === 'verified'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        <CheckCircle className="h-3 w-3" />
                        {user.verificationStatus || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <p className="text-xs text-slate-500">
              Page <strong className="text-slate-700">{page}</strong> of <strong className="text-slate-700">{totalPages}</strong>
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50 hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50 hover:bg-slate-50"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
