import { useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Edit3,
  Save,
  Lock,
} from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const profileFrom = (buyer) => ({
  businessName: buyer?.businessName || '',
  fullName: buyer?.fullName || '',
  phone: buyer?.phone || '',
  city: buyer?.city || '',
  address: buyer?.businessAddress || buyer?.pickupAddress || '',
  pincode: buyer?.pincode || '',
  gstNumber: buyer?.gstNumber || '',
})

export default function BuyerProfile() {
  const { seller: buyer, updateSeller, refreshToken } = useAuth()
  const [editingInfo, setEditingInfo] = useState(false)
  const [profile, setProfile] = useState(() => profileFrom(buyer))
  const [saving, setSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' })

  const [passForm, setPassForm] = useState({ current: '', newPass: '', confirm: '' })
  const [passMsg, setPassMsg] = useState({ type: '', text: '' })
  const [passSaving, setPassSaving] = useState(false)

  const shown = editingInfo ? profile : profileFrom(buyer)
  const verified = buyer?.verificationStatus === 'verified'

  const handleSaveProfile = async () => {
    setSaving(true)
    setProfileMsg({ type: '', text: '' })
    try {
      const res = await api.updateProfile({
        businessName: profile.businessName.trim(),
        fullName: profile.fullName.trim(),
        phone: profile.phone.trim(),
        city: profile.city.trim(),
        businessAddress: profile.address.trim(),
        pincode: profile.pincode.trim(),
        gstNumber: profile.gstNumber.trim(),
      })
      updateSeller(res.seller)
      setEditingInfo(false)
      setProfileMsg({ type: 'success', text: 'Profile updated.' })
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (passForm.newPass !== passForm.confirm) {
      setPassMsg({ type: 'error', text: 'New passwords do not match' })
      return
    }
    setPassSaving(true)
    setPassMsg({ type: '', text: '' })
    try {
      const data = await api.updatePassword(passForm.current, passForm.newPass)
      refreshToken(data.token)
      setPassForm({ current: '', newPass: '', confirm: '' })
      setPassMsg({ type: 'success', text: 'Password updated. Other devices have been signed out.' })
    } catch (err) {
      setPassMsg({ type: 'error', text: err.message || 'Failed to update password' })
    } finally {
      setPassSaving(false)
    }
  }

  const field = (key) => ({
    disabled: !editingInfo,
    value: shown[key],
    onChange: (e) => setProfile({ ...profile, [key]: e.target.value }),
  })

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
                {(shown.businessName || shown.fullName || 'B').charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{shown.businessName || shown.fullName}</h2>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${verified ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                    {verified ? 'Verified Buyer' : 'Verification pending'}
                  </span>
                  {buyer?.gstNumber && (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <ShieldCheck className="h-3.5 w-3.5" /> GST on file
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {editingInfo && (
                <button
                  onClick={() => setEditingInfo(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => {
                  if (editingInfo) handleSaveProfile()
                  else {
                    setProfile(profileFrom(buyer))
                    setEditingInfo(true)
                  }
                }}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {editingInfo ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                {editingInfo ? (saving ? 'Saving...' : 'Save Changes') : 'Edit Profile'}
              </button>
            </div>
          </div>

          {profileMsg.text && (
            <div className={`mt-4 flex items-center gap-2 rounded-xl p-3 text-xs ${profileMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
              {profileMsg.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              {profileMsg.text}
            </div>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Input label="Business Name" {...field('businessName')} />
            <Input label="Contact Representative" {...field('fullName')} />
            <Input label="Email Address" type="email" disabled value={buyer?.email || ''} hint="Contact support to change your email." />
            <Input label="Phone Number" {...field('phone')} />
            <Input label="Operating City" {...field('city')} />
            <Input label="GST Registration Number" {...field('gstNumber')} />
            <Input label="Facility / Delivery Address" {...field('address')} />
            <Input label="Pincode" {...field('pincode')} />
          </div>
        </div>

        {/* Change Password Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Security Credentials</h2>
          </div>

          <form onSubmit={handleUpdatePassword} className="mt-5 space-y-4">
            {passMsg.text && (
              <div className={`rounded-xl p-3 text-xs ${passMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-700'}`}>{passMsg.text}</div>
            )}
            <div className="grid gap-4 sm:grid-cols-3">
              <PasswordInput label="Current Password" value={passForm.current} onChange={(v) => setPassForm({ ...passForm, current: v })} />
              <PasswordInput label="New Password" value={passForm.newPass} onChange={(v) => setPassForm({ ...passForm, newPass: v })} />
              <PasswordInput label="Confirm Password" value={passForm.confirm} onChange={(v) => setPassForm({ ...passForm, confirm: v })} />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={passSaving}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {passSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function Input({ label, hint, ...props }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500">{label}</label>
      <input
        type="text"
        {...props}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 disabled:opacity-80"
      />
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
    </div>
  )
}

function PasswordInput({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
      />
    </div>
  )
}
