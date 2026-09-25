import { useState } from 'react'
import {
  ShieldCheck,
  Edit3,
  Save,
  Lock,
} from 'lucide-react'

export default function BuyerProfile() {
  const buyer = JSON.parse(localStorage.getItem('sellerData') || '{}')

  const [editingInfo, setEditingInfo] = useState(false)
  const [profile, setProfile] = useState({
    businessName: buyer.businessName || 'Green Plastics Recycling Pvt Ltd',
    fullName: buyer.fullName || 'Purchasing Manager',
    email: buyer.email || 'procurement@greenplastics.com',
    phone: buyer.phone || '+91 98765 43210',
    city: buyer.city || 'Pune',
    address: buyer.pickupAddress || buyer.businessAddress || 'Plot 44, MIDC Bhosari, Pune',
    pincode: buyer.pincode || '411026',
    gstNumber: buyer.gstNumber || '27AAACG1234F1Z5',
  })

  const [passForm, setPassForm] = useState({ current: '', newPass: '', confirm: '' })
  const [passMsg, setPassMsg] = useState('')

  const handleSaveProfile = () => {
    setEditingInfo(false)
    const updated = { ...buyer, ...profile }
    localStorage.setItem('sellerData', JSON.stringify(updated))
  }

  const handleUpdatePassword = (e) => {
    e.preventDefault()
    if (passForm.newPass !== passForm.confirm) {
      setPassMsg('New passwords do not match')
      return
    }
    setPassMsg('Password successfully updated!')
    setPassForm({ current: '', newPass: '', confirm: '' })
  }

  return (
    <div className="min-h-full bg-[#f8faf8] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Buyer Profile</h1>
          <p className="mt-1 text-sm text-slate-500">Manage business information, procurement addresses, and security credentials.</p>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-bold text-blue-700">
                {profile.businessName?.charAt(0) || 'B'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{profile.businessName}</h2>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                    Verified Buyer
                  </span>
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" /> GST Compliant
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (editingInfo) handleSaveProfile()
                else setEditingInfo(true)
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              {editingInfo ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
              {editingInfo ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-500">Business Name</label>
              <input
                type="text"
                disabled={!editingInfo}
                value={profile.businessName}
                onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 disabled:opacity-80"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Contact Representative</label>
              <input
                type="text"
                disabled={!editingInfo}
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 disabled:opacity-80"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Email Address</label>
              <input
                type="email"
                disabled={!editingInfo}
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 disabled:opacity-80"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Phone Number</label>
              <input
                type="text"
                disabled={!editingInfo}
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 disabled:opacity-80"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Operating City</label>
              <input
                type="text"
                disabled={!editingInfo}
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 disabled:opacity-80"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">GST Registration Number</label>
              <input
                type="text"
                disabled={!editingInfo}
                value={profile.gstNumber}
                onChange={(e) => setProfile({ ...profile, gstNumber: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 disabled:opacity-80"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500">Facility / Delivery Address</label>
              <input
                type="text"
                disabled={!editingInfo}
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 disabled:opacity-80"
              />
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Security Credentials</h2>
          </div>

          <form onSubmit={handleUpdatePassword} className="mt-5 space-y-4">
            {passMsg && (
              <div className="rounded-xl bg-blue-50 p-3 text-xs text-blue-700">{passMsg}</div>
            )}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Current Password</label>
                <input
                  type="password"
                  value={passForm.current}
                  onChange={(e) => setPassForm({ ...passForm, current: e.target.value })}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">New Password</label>
                <input
                  type="password"
                  value={passForm.newPass}
                  onChange={(e) => setPassForm({ ...passForm, newPass: e.target.value })}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Confirm Password</label>
                <input
                  type="password"
                  value={passForm.confirm}
                  onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
