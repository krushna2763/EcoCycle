import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Leaf,
  Mail,
  MapPin,
  Phone,
  Recycle,
  ShieldCheck,
  ShoppingCart,
  Truck,
  User,
} from 'lucide-react'
import Logo from '../../components/common/Logo'
import ImageWithFallback from '../../components/common/ImageWithFallback'
import buyerImg from '../../assets/buyer.jpg'

const API_BASE = 'http://localhost:5000/api'

const BUYER_BENEFITS = [
  { icon: ShieldCheck, title: 'Verified Sellers', desc: 'Connect with verified and trusted plastic waste sellers.' },
  { icon: ShoppingCart, title: 'Best Market Prices', desc: 'Get competitive prices for your recyclable materials.' },
  { icon: Truck, title: 'Easy Pickup', desc: 'Schedule convenient pickups from sellers.' },
]

export default function BuyerRegistration() {
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const [form, setForm] = useState({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessType: '',
    gstNumber: '',
    city: '',
    address: '',
    pincode: '',
  })

  const update = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const canContinue = step === 1
    ? form.businessName && form.contactPerson && form.email && form.phone && form.password && form.confirmPassword
    : form.businessType && form.city && form.address && form.pincode

  const handleRegister = async () => {
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          fullName: form.contactPerson,
          phone: form.phone,
          sellerType: 'business',
          businessName: form.businessName,
          businessType: form.businessType,
          gstNumber: form.gstNumber,
          city: form.city,
          businessAddress: form.address,
          pincode: form.pincode,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Registration failed')
        return
      }
      localStorage.setItem('sellerToken', data.token)
      localStorage.setItem('sellerData', JSON.stringify(data.seller))
      setStep(3)
    } catch {
      setStep(3)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8faf8]">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Already have an account?</span>
          <Link to="/login" className="rounded-lg border border-blue-600 px-4 py-2 font-semibold text-blue-700 transition-colors hover:bg-blue-50">
            Log In
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]">
          {/* Left Panel */}
          <aside className="flex flex-col items-center lg:items-start">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Join as a{' '}
              <span className="text-blue-600">
                Buyer{' '}
                <ShoppingCart className="mb-0.5 inline-block h-5 w-5 text-blue-500" strokeWidth={2.5} />
              </span>
            </h2>
            <p className="mt-3 max-w-[260px] text-sm leading-relaxed text-slate-500">
              Find quality recyclable materials from trusted sellers and get the best prices.
            </p>
            <div className="mt-6 w-full max-w-[260px] overflow-hidden rounded-2xl">
              <ImageWithFallback
                src={buyerImg}
                alt="EcoCycle buyer illustration"
                className="h-auto w-full object-contain"
                fallback={<Recycle className="mx-auto h-20 w-20 text-blue-500" strokeWidth={1.5} />}
              />
            </div>
            <div className="mt-6 w-full max-w-[260px] space-y-4">
              {BUYER_BENEFITS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50">
                    <Icon className="h-4.5 w-4.5 text-blue-600" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Right Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Buyer Registration</h1>
            <p className="mt-1 text-sm text-slate-500">Create your buyer account to start purchasing recyclable materials.</p>

            {/* Steps indicator */}
            <div className="mt-6 flex items-center gap-3">
              {['Account Info', 'Business Details', 'Complete'].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    step > i + 1 ? 'bg-brand-600 text-white' : step === i + 1 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {step > i + 1 ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </span>
                  <span className={`text-xs font-medium ${step === i + 1 ? 'text-brand-700' : 'text-slate-400'}`}>{s}</span>
                  {i < 2 && <div className="mx-2 h-px w-8 bg-slate-200" />}
                </div>
              ))}
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>
            )}

            {/* Step 1 */}
            {step === 1 && (
              <div className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Business Name" required>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Enter business name" value={form.businessName} onChange={update('businessName')} className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                    </div>
                  </Field>
                  <Field label="Contact Person" required>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Full name" value={form.contactPerson} onChange={update('contactPerson')} className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                    </div>
                  </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Email Address" required>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input type="email" placeholder="business@email.com" value={form.email} onChange={update('email')} className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                    </div>
                  </Field>
                  <Field label="Phone Number" required>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={update('phone')} className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                    </div>
                  </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Password" required>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" value={form.password} onChange={update('password')} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                  <Field label="Confirm Password" required>
                    <div className="relative">
                      <input type={showConfirm ? 'text' : 'password'} placeholder="Confirm your password" value={form.confirmPassword} onChange={update('confirmPassword')} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/60 p-4">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-blue-600" />
                  <p className="text-sm text-slate-600">Your information is secure and will only be used for verification.</p>
                </div>
                <div className="flex justify-end">
                  <button onClick={() => canContinue && setStep(2)} disabled={!canContinue} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="mt-8 space-y-5">
                <Field label="Business Type" required>
                  <select value={form.businessType} onChange={update('businessType')} className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20">
                    <option value="">Select business type</option>
                    <option>Recycling Center</option>
                    <option>Manufacturing Unit</option>
                    <option>Wholesaler</option>
                    <option>Retailer</option>
                    <option>Other</option>
                  </select>
                </Field>
                <Field label="GST Number (Optional)">
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Enter GST number" value={form.gstNumber} onChange={update('gstNumber')} className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                  </div>
                </Field>
                <Field label="Business Address" required>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Complete business address" value={form.address} onChange={update('address')} className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                  </div>
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="City" required>
                    <input type="text" placeholder="Enter city" value={form.city} onChange={update('city')} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                  </Field>
                  <Field label="Pincode" required>
                    <input type="text" placeholder="Enter pincode" value={form.pincode} onChange={update('pincode')} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                  </Field>
                </div>
                <div className="flex items-center justify-between">
                  <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button onClick={handleRegister} disabled={!canContinue || loading} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50">
                    {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <CheckCircle2 className="h-4 w-4" />}
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 - Complete */}
            {step === 3 && (
              <div className="mt-10 text-center">
                <CheckCircle2 className="mx-auto h-16 w-16 text-brand-600" />
                <h2 className="mt-4 text-xl font-extrabold text-slate-900">Registration Completed!</h2>
                <p className="mt-2 text-sm text-slate-500">Your buyer account has been created successfully.</p>
                <div className="mt-8 flex flex-col items-center gap-3">
                  <Link to="/seller/dashboard" className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
                    Go to Dashboard <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/" className="text-sm font-semibold text-blue-700 underline underline-offset-4 hover:text-blue-800">
                    Go to Home
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}
