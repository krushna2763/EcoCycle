import { useState, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  HeadphonesIcon,
  Key,
  MapPin,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Trash2,
  User,
  Users,
} from 'lucide-react'
import api, { assetUrl } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useApi } from '../../hooks/useApi'
import { formatDate } from '../../lib/format'

const VERIFICATION = {
  verified: { label: 'Verified', className: 'bg-brand-50 text-brand-600', icon: CheckCircle2 },
  pending: { label: 'Verification pending', className: 'bg-amber-50 text-amber-600', icon: Clock },
  rejected: { label: 'Verification rejected', className: 'bg-red-50 text-red-600', icon: AlertCircle },
}

const CHANNELS = [
  { key: 'email', label: 'Email Notifications', desc: 'Receive email updates about requests and collections.' },
  { key: 'sms', label: 'SMS Notifications', desc: 'Receive SMS updates about collections.' },
  { key: 'push', label: 'Push Notifications', desc: 'Receive push notifications in your browser.' },
  { key: 'marketing', label: 'Marketing Communications', desc: 'Receive offers and updates from EcoCycle.' },
]

const infoFrom = (user) => ({ fullName: user?.fullName || '', phone: user?.phone || '' })
const locationFrom = (user) => ({ address: user?.pickupAddress || '', city: user?.city || '', pincode: user?.pincode || '' })

export default function Profile() {
  const { seller, updateSeller, refreshToken } = useAuth()
  const { data: statsData } = useApi(() => api.getDashboardStats(), [])
  const { data: settingsData, setData: setSettingsData } = useApi(() => api.getSettings('seller'), [])
  const stats = statsData?.stats
  const channels = settingsData?.settings?.channels

  const [editingInfo, setEditingInfo] = useState(false)
  const [editingLocation, setEditingLocation] = useState(false)
  const avatarInputRef = useRef(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showOldPass, setShowOldPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [passError, setPassError] = useState('')
  const [passSaving, setPassSaving] = useState(false)
  const [passSuccess, setPassSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [editProfile, setEditProfile] = useState(() => infoFrom(seller))
  const [editLocation, setEditLocation] = useState(() => locationFrom(seller))
  const [password, setPassword] = useState({ old: '', new: '', confirm: '' })

  const avatar = assetUrl(seller?.avatar)
  const verification = VERIFICATION[seller?.verificationStatus] || VERIFICATION.pending
  const VerificationIcon = verification.icon

  const updateProfileField = (field) => (e) => setEditProfile((p) => ({ ...p, [field]: e.target.value }))
  const updateLocationField = (field) => (e) => setEditLocation((p) => ({ ...p, [field]: e.target.value }))

  const saveProfile = async (changes, onDone) => {
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const res = await api.updateProfile(changes)
      updateSeller(res.seller)
      setMessage({ type: 'success', text: 'Profile updated.' })
      onDone?.()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveInfo = () =>
    saveProfile({ fullName: editProfile.fullName.trim(), phone: editProfile.phone.trim() }, () => setEditingInfo(false))

  const handleSaveLocation = () =>
    saveProfile(
      { pickupAddress: editLocation.address.trim(), city: editLocation.city.trim(), pincode: editLocation.pincode.trim() },
      () => setEditingLocation(false)
    )

  const handleAvatar = async (file) => {
    if (!file) return
    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Choose a JPG or PNG image under 5MB.' })
      return
    }
    setSaving(true)
    setMessage({ type: '', text: '' })
    let uploaded = null
    try {
      ;[uploaded] = await api.uploadImages([file])
      const res = await api.updateProfile({ avatar: uploaded.url })
      updateSeller(res.seller)
      setMessage({ type: 'success', text: 'Profile photo updated.' })
    } catch (err) {
      // Do not leave an unused photo behind when the profile could not be updated
      if (uploaded) api.discardUploads([uploaded])
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const toggleChannel = async (key) => {
    if (!channels) return
    const next = !channels[key]
    setSettingsData((prev) => ({ ...prev, settings: { ...prev.settings, channels: { ...prev.settings.channels, [key]: next } } }))
    try {
      await api.updateSettings({ channels: { [key]: next } }, 'seller')
    } catch (err) {
      setSettingsData((prev) => ({ ...prev, settings: { ...prev.settings, channels: { ...prev.settings.channels, [key]: !next } } }))
      setMessage({ type: 'error', text: err.message })
    }
  }

  const handleChangePassword = async () => {
    setPassError('')
    setPassSuccess('')
    if (password.new !== password.confirm) {
      setPassError('New passwords do not match')
      return
    }
    setPassSaving(true)
    try {
      // Server verifies the current password and revokes older tokens
      const data = await api.updatePassword(password.old, password.new)
      refreshToken(data.token)
      setPassword({ old: '', new: '', confirm: '' })
      setPassSuccess('Password updated. Other devices have been signed out.')
    } catch (error) {
      setPassError(error.message || 'Failed to update password')
    } finally {
      setPassSaving(false)
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your personal information and seller account.</p>

        {message.text && (
          <div className={`mt-4 flex items-center gap-2 rounded-xl border p-3 text-sm ${
            message.type === 'error' ? 'border-red-200 bg-red-50 text-red-600' : 'border-brand-200 bg-brand-50 text-brand-700'
          }`}>
            {message.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            {message.text}
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* ── Left Column ── */}
          <div className="space-y-6">
            {/* Profile Header Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start sm:gap-6">
                <div className="relative shrink-0">
                  {avatar ? (
                    <img src={avatar} alt="Profile" className="h-24 w-24 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-100 text-3xl font-bold text-brand-700">
                      {(seller?.fullName || 'S').charAt(0)}
                    </div>
                  )}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => { handleAvatar(e.target.files?.[0]); e.target.value = '' }}
                  />
                  <button
                    aria-label="Change profile photo"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={saving}
                    className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-4 flex-1 sm:mt-0">
                  <h2 className="text-xl font-bold text-slate-900">{seller?.fullName}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                      {seller?.sellerType === 'business' ? 'Business Seller' : 'Individual Seller'}
                    </span>
                    <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${verification.className}`}>
                      <VerificationIcon className="h-3 w-3" /> {verification.label}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1.5 text-sm text-slate-500">
                    <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /> {seller?.email}</p>
                    <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /> {seller?.phone}</p>
                    {seller?.city && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" /> {seller.city}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <User className="h-5 w-5 text-slate-500" />
                  Personal Information
                </h3>
                {!editingInfo && (
                  <button onClick={() => { setEditProfile(infoFrom(seller)); setEditingInfo(true) }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800">
                    <Edit3 className="h-3.5 w-3.5" /> Edit Information
                  </button>
                )}
              </div>

              {editingInfo ? (
                <div className="mt-5 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-3">
                    <EditField label="Full Name" value={editProfile.fullName} onChange={updateProfileField('fullName')} />
                    <EditField label="Email Address" value={seller?.email || ''} type="email" disabled hint="Contact support to change your email." />
                    <EditField label="Phone Number" value={editProfile.phone} onChange={updateProfileField('phone')} type="tel" />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setEditingInfo(false)} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                    <button onClick={handleSaveInfo} disabled={saving} className="rounded-xl bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deeper disabled:opacity-50">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 grid gap-5 sm:grid-cols-3">
                  <InfoField label="Full Name" value={seller?.fullName} />
                  <InfoField label="Email Address" value={seller?.email} />
                  <InfoField label="Phone Number" value={seller?.phone} />
                  <InfoField label="Seller Type" value={seller?.sellerType === 'business' ? 'Business Seller' : 'Individual Seller'} />
                  <InfoField label="Date of Registration" value={formatDate(seller?.createdAt)} />
                  <InfoField label="Account Status" value={<span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${verification.className}`}>{verification.label}</span>} />
                </div>
              )}
            </div>

            {/* Pickup Location */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <MapPin className="h-5 w-5 text-slate-500" />
                  Pickup Location
                </h3>
                {!editingLocation && (
                  <button onClick={() => { setEditLocation(locationFrom(seller)); setEditingLocation(true) }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800">
                    <Edit3 className="h-3.5 w-3.5" /> Edit Location
                  </button>
                )}
              </div>

              {editingLocation ? (
                <div className="mt-5 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-3">
                    <EditField label="Address" value={editLocation.address} onChange={updateLocationField('address')} />
                    <EditField label="City" value={editLocation.city} onChange={updateLocationField('city')} />
                    <EditField label="Pincode" value={editLocation.pincode} onChange={updateLocationField('pincode')} />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setEditingLocation(false)} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                    <button onClick={handleSaveLocation} disabled={saving} className="rounded-xl bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deeper disabled:opacity-50">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-5 grid gap-5 sm:grid-cols-3">
                    <InfoField label="Address" value={seller?.pickupAddress} />
                    <InfoField label="City" value={seller?.city} />
                    <InfoField label="Pincode" value={seller?.pincode} />
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-brand-50/60 px-3 py-2 text-xs text-slate-600">
                    <MapPin className="h-3.5 w-3.5 text-brand-500" />
                    This is your default pickup location for collections.
                  </div>
                </>
              )}
            </div>

            {/* Bottom row */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Change Password */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <Key className="h-5 w-5 text-slate-500" />
                  Change Password
                </h3>
                <p className="mt-1 text-xs text-slate-500">Update your password to keep your account secure.</p>
                <div className="mt-4 space-y-4">
                  {passError && <p className="text-xs text-red-500">{passError}</p>}
                  {passSuccess && <p className="text-xs text-brand-600">{passSuccess}</p>}
                  <PasswordField label="Current Password" value={password.old} onChange={(v) => { setPassword((p) => ({ ...p, old: v })); setPassError('') }} show={showOldPass} toggle={() => setShowOldPass(!showOldPass)} placeholder="Enter current password" />
                  <PasswordField label="New Password" value={password.new} onChange={(v) => setPassword((p) => ({ ...p, new: v }))} show={showNewPass} toggle={() => setShowNewPass(!showNewPass)} placeholder="Enter new password" />
                  <PasswordField label="Confirm New Password" value={password.confirm} onChange={(v) => setPassword((p) => ({ ...p, confirm: v }))} show={showConfirmPass} toggle={() => setShowConfirmPass(!showConfirmPass)} placeholder="Confirm new password" />
                  <button onClick={handleChangePassword} disabled={passSaving || !password.old || !password.new} className="rounded-xl bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deeper disabled:opacity-50">
                    {passSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>

              {/* Account Settings */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <Shield className="h-5 w-5 text-slate-500" />
                  Account Settings
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Choose how you'd like to be contacted. In-app notifications are always on; other channels will be used once available.
                </p>
                <div className="mt-4 space-y-4">
                  {CHANNELS.map(({ key, label, desc }) => (
                    <ToggleRow key={key} label={label} desc={desc} enabled={Boolean(channels?.[key])} disabled={!channels} onToggle={() => toggleChannel(key)} />
                  ))}
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-base font-bold text-red-600">
                    <Trash2 className="h-5 w-5" />
                    Danger Zone
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">Once you delete your account, there is no going back. Please be certain.</p>
                </div>
                <button onClick={() => setShowDeleteModal(true)} className="inline-flex items-center gap-2 rounded-xl border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </button>
              </div>
            </div>

            {/* Support */}
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-brand-200 bg-brand-50/50 p-6 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100">
                  <HeadphonesIcon className="h-6 w-6 text-brand-600" strokeWidth={1.8} />
                </span>
                <h3 className="text-sm font-bold text-slate-900">Need help? Our support team is here to help you.</h3>
              </div>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-deeper">
                Contact Support →
              </Link>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">Account Overview</h3>
              <div className="mt-4 space-y-3">
                <OverviewItem icon={<Users className="h-5 w-5 text-blue-500" />} iconBg="bg-blue-50" label="Total Listings" value={stats?.totalListings} to="/seller/dashboard/listings" />
                <OverviewItem icon={<ShieldCheck className="h-5 w-5 text-brand-500" />} iconBg="bg-brand-50" label="Completed Collections" value={stats?.completedCollections} to="/seller/dashboard/collections" />
                <OverviewItem icon={<FileText className="h-5 w-5 text-violet-500" />} iconBg="bg-violet-50" label="Total Requests" value={stats?.totalRequests} to="/seller/dashboard/requests" />
                <OverviewItem icon={<Eye className="h-5 w-5 text-amber-500" />} iconBg="bg-amber-50" label="Listing Views" value={stats?.totalViews} to="/seller/dashboard/listings" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">Delete Account?</h2>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Account deletion is handled by our support team so that open requests and collections can be closed properly.
              Contact support to request deletion.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <Link to="/contact" className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700">Contact Support</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-900">{value || '—'}</p>
    </div>
  )
}

function EditField({ label, value, onChange, type = 'text', disabled = false, hint }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        readOnly={disabled}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50 disabled:text-slate-500"
      />
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
    </div>
  )
}

function OverviewItem({ icon, iconBg, label, value, to }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>{icon}</span>
      <div className="flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-lg font-bold text-slate-900">{value ?? '—'}</p>
      </div>
      <span className="text-slate-300">›</span>
    </Link>
  )
}

function PasswordField({ label, value, onChange, show, toggle, placeholder }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

function ToggleRow({ label, desc, enabled, onToggle, disabled }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        onClick={onToggle}
        disabled={disabled}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${enabled ? 'bg-brand-600' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  )
}
