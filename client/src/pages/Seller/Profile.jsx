import { useState, useRef } from 'react'
import {
  Camera,
  CheckCircle2,
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

export default function Profile() {
  const seller = JSON.parse(localStorage.getItem('sellerData') || '{}')

  const [editingInfo, setEditingInfo] = useState(false)
  const [editingLocation, setEditingLocation] = useState(false)
  const [avatar, setAvatar] = useState(null)
  const avatarInputRef = useRef(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showOldPass, setShowOldPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [passError, setPassError] = useState('')

  const [profile, setProfile] = useState({
    fullName: seller.fullName || 'Krushna Bhagawat',
    email: seller.email || 'krushna@example.com',
    phone: seller.phone || '+91 98765 43210',
    sellerType: seller.sellerType === 'business' ? 'Business Seller' : 'Individual Seller',
    city: seller.city || 'Pune',
    address: seller.pickupAddress || '12, Kothrud, Near Vanaz Corner',
    area: 'Kothrud',
    state: 'Maharashtra',
    pincode: seller.pincode || '411038',
    country: 'India',
  })

  // Editable copies
  const [editProfile, setEditProfile] = useState({ ...profile })
  const [editLocation, setEditLocation] = useState({ ...profile })
  const [password, setPassword] = useState({ old: '', new: '', confirm: '' })
  const [notifications, setNotifications] = useState({
    email: true, sms: true, push: true, marketing: false,
  })

  const updateProfile = (field) => (e) => setEditProfile((p) => ({ ...p, [field]: e.target.value }))
  const updateLocation = (field) => (e) => setEditLocation((p) => ({ ...p, [field]: e.target.value }))

  const handleSaveInfo = () => {
    setProfile({ ...editProfile })
    setEditingInfo(false)
    // Save to localStorage
    const updated = { ...seller, fullName: editProfile.fullName, email: editProfile.email, phone: editProfile.phone }
    localStorage.setItem('sellerData', JSON.stringify(updated))
  }

  const handleCancelInfo = () => {
    setEditProfile({ ...profile })
    setEditingInfo(false)
  }

  const handleSaveLocation = () => {
    setProfile({ ...editLocation })
    setEditingLocation(false)
    const updated = { ...seller, city: editLocation.city, pickupAddress: editLocation.address, pincode: editLocation.pincode }
    localStorage.setItem('sellerData', JSON.stringify(updated))
  }

  const handleCancelLocation = () => {
    setEditLocation({ ...profile })
    setEditingLocation(false)
  }

  const handleChangePassword = async () => {
    setPassError('')
    const token = localStorage.getItem('sellerToken')
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: password.old }),
      })
      const data = await res.json()
      if (!data.success) {
        setPassError('Current password is incorrect')
        return
      }
      // Password verified, update to new password
      await fetch('http://localhost:5000/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newPassword: password.new }),
      })
      setPassword({ old: '', new: '', confirm: '' })
      setPassError('')
      alert('Password updated successfully!')
    } catch {
      setPassError('Current password is incorrect')
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your personal information and seller account.</p>

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
                      {profile.fullName.charAt(0)}
                    </div>
                  )}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          alert('Image must be under 5MB')
                          return
                        }
                        const reader = new FileReader()
                        reader.onload = (ev) => setAvatar(ev.target.result)
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm hover:bg-brand-700"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-4 flex-1 sm:mt-0">
                  <h2 className="text-xl font-bold text-slate-900">{profile.fullName}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">{profile.sellerType}</span>
                    <span className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </span>
                  </div>
                  <div className="mt-3 space-y-1.5 text-sm text-slate-500">
                    <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /> {profile.email}</p>
                    <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /> {profile.phone}</p>
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" /> {profile.city}, Maharashtra, India</p>
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
                  <button onClick={() => setEditingInfo(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800">
                    <Edit3 className="h-3.5 w-3.5" /> Edit Information
                  </button>
                )}
              </div>

              {editingInfo ? (
                <div className="mt-5 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-3">
                    <EditField label="Full Name" value={editProfile.fullName} onChange={updateProfile('fullName')} />
                    <EditField label="Email Address" value={editProfile.email} onChange={updateProfile('email')} type="email" />
                    <EditField label="Phone Number" value={editProfile.phone} onChange={updateProfile('phone')} type="tel" />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={handleCancelInfo} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                    <button onClick={handleSaveInfo} className="rounded-xl bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deeper">Save Changes</button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 grid gap-5 sm:grid-cols-3">
                  <InfoField label="Full Name" value={profile.fullName} />
                  <InfoField label="Email Address" value={profile.email} />
                  <InfoField label="Phone Number" value={profile.phone} />
                  <InfoField label="Seller Type" value={profile.sellerType} />
                  <InfoField label="Date of Registration" value="16 August 2026" />
                  <InfoField label="Account Status" value={<span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">Active</span>} />
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
                  <button onClick={() => setEditingLocation(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800">
                    <Edit3 className="h-3.5 w-3.5" /> Edit Location
                  </button>
                )}
              </div>

              {editingLocation ? (
                <div className="mt-5 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-3">
                    <EditField label="Shop/House No." value={editLocation.address} onChange={updateLocation('address')} />
                    <EditField label="Area / Street" value={editLocation.area} onChange={updateLocation('area')} />
                    <EditField label="City" value={editLocation.city} onChange={updateLocation('city')} />
                    <EditField label="State" value={editLocation.state} onChange={updateLocation('state')} />
                    <EditField label="Pincode" value={editLocation.pincode} onChange={updateLocation('pincode')} />
                    <EditField label="Country" value={editLocation.country} onChange={updateLocation('country')} />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={handleCancelLocation} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                    <button onClick={handleSaveLocation} className="rounded-xl bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deeper">Save Changes</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-5 grid gap-5 sm:grid-cols-3">
                    <InfoField label="Shop/House No." value={profile.address} />
                    <InfoField label="Area / Street" value={profile.area} />
                    <InfoField label="City" value={profile.city} />
                    <InfoField label="State" value={profile.state} />
                    <InfoField label="Pincode" value={profile.pincode} />
                    <InfoField label="Country" value={profile.country} />
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
                  <PasswordField label="Current Password" value={password.old} onChange={(v) => { setPassword((p) => ({ ...p, old: v })); setPassError('') }} show={showOldPass} toggle={() => setShowOldPass(!showOldPass)} placeholder="Enter current password" />
                  <PasswordField label="New Password" value={password.new} onChange={(v) => setPassword((p) => ({ ...p, new: v }))} show={showNewPass} toggle={() => setShowNewPass(!showNewPass)} placeholder="Enter new password" />
                  <PasswordField label="Confirm New Password" value={password.confirm} onChange={(v) => setPassword((p) => ({ ...p, confirm: v }))} show={showConfirmPass} toggle={() => setShowConfirmPass(!showConfirmPass)} placeholder="Confirm new password" />
                  <button onClick={handleChangePassword} className="rounded-xl bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deeper">Update Password</button>
                </div>
              </div>

              {/* Account Settings */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <Shield className="h-5 w-5 text-slate-500" />
                  Account Settings
                </h3>
                <p className="mt-1 text-xs text-slate-500">Manage your notification and communication preferences.</p>
                <div className="mt-4 space-y-4">
                  <ToggleRow label="Email Notifications" desc="Receive email updates about requests and collections." enabled={notifications.email} onToggle={() => setNotifications((p) => ({ ...p, email: !p.email }))} />
                  <ToggleRow label="SMS Notifications" desc="Receive SMS updates about collections." enabled={notifications.sms} onToggle={() => setNotifications((p) => ({ ...p, sms: !p.sms }))} />
                  <ToggleRow label="Push Notifications" desc="Receive push notifications in your browser." enabled={notifications.push} onToggle={() => setNotifications((p) => ({ ...p, push: !p.push }))} />
                  <ToggleRow label="Marketing Communications" desc="Receive offers and updates from EcoCycle." enabled={notifications.marketing} onToggle={() => setNotifications((p) => ({ ...p, marketing: !p.marketing }))} />
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
              <button className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-deeper">
                Contact Support →
              </button>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">Account Overview</h3>
              <div className="mt-4 space-y-3">
                <OverviewItem icon={<Users className="h-5 w-5 text-blue-500" />} iconBg="bg-blue-50" label="Total Listings" value="12" />
                <OverviewItem icon={<ShieldCheck className="h-5 w-5 text-brand-500" />} iconBg="bg-brand-50" label="Total Collections" value="5" />
                <OverviewItem icon={<FileText className="h-5 w-5 text-violet-500" />} iconBg="bg-violet-50" label="Total Requests" value="8" />
                <OverviewItem icon={<Eye className="h-5 w-5 text-amber-500" />} iconBg="bg-amber-50" label="Profile Views" value="24" />
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
              This action cannot be undone. All your data, listings, and collections will be permanently deleted.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={() => setShowDeleteModal(false)} className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700">Yes, Delete Account</button>
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
      <p className="mt-0.5 text-sm font-medium text-slate-900">{value}</p>
    </div>
  )
}

function EditField({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
      />
    </div>
  )
}

function OverviewItem({ icon, iconBg, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>{icon}</span>
      <div className="flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-lg font-bold text-slate-900">{value}</p>
      </div>
      <span className="text-slate-300">›</span>
    </div>
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
        <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

function ToggleRow({ label, desc, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <button onClick={onToggle} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${enabled ? 'bg-brand-600' : 'bg-slate-300'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  )
}
