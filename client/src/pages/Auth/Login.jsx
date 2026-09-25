import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Recycle,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  User,
} from 'lucide-react'
import Logo from '../../components/common/Logo'
import ImageWithFallback from '../../components/common/ImageWithFallback'
import heroImg from '../../assets/impact/livelihood.png'

const API_BASE = 'http://localhost:5000/api'

const SELLER_BENEFITS = [
  { icon: ShieldCheck, title: 'Verified & Trusted', desc: 'All buyers are verified to ensure safe and secure transactions.' },
  { icon: ShoppingBag, title: 'Get the Best Value', desc: 'Receive competitive prices for your recyclable plastic waste.' },
  { icon: Truck, title: 'Hassle-free Pickup', desc: 'Schedule pickups at your convenience and track your orders easily.' },
]

const BUYER_BENEFITS = [
  { icon: ShieldCheck, title: 'Verified & Trusted', desc: 'All businesses are verified for safe and secure transactions.' },
  { icon: Store, title: 'Grow Your Business', desc: 'Connect with reliable sellers and source thousands of buyers.' },
  { icon: ShoppingBag, title: 'Best Market Prices', desc: 'Get the best market rates for your recyclable plastic waste.' },
]

export default function Login() {
  const [loginType, setLoginType] = useState('individual')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [individualForm, setIndividualForm] = useState({ email: '', password: '' })
  const [businessForm, setBusinessForm] = useState({ email: '', password: '', gst: '' })

  const navigate = useNavigate()
  const isIndividual = loginType === 'individual'
  const benefits = isIndividual ? SELLER_BENEFITS : BUYER_BENEFITS

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = isIndividual ? individualForm : businessForm

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Login failed')
        return
      }

      // Store token and seller data
      localStorage.setItem('sellerToken', data.token)
      localStorage.setItem('sellerData', JSON.stringify(data.seller))

      // Role-based redirect to dashboard
      if (data.seller?.role === 'buyer') {
        navigate({ to: '/buyer/dashboard' })
      } else {
        navigate({ to: '/seller/dashboard' })
      }
    } catch {
      // If API is not available, use demo login
      const demoSeller = {
        id: 'demo',
        fullName: 'Krushna Bhagawat',
        email: form.email || 'krushna@ecocycle.com',
        role: isIndividual ? 'seller' : 'seller',
        sellerType: isIndividual ? 'individual' : 'business',
      }
      localStorage.setItem('sellerToken', 'demo-token')
      localStorage.setItem('sellerData', JSON.stringify(demoSeller))
      navigate({ to: '/seller/dashboard' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8faf8]">
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">New to EcoCycle?</span>
          <Link
            to="/signup"
            className="rounded-lg border border-brand-600 px-4 py-2 font-semibold text-brand-700 transition-colors hover:bg-brand-50"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* ── Main ── */}
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-16 pt-6 lg:flex-row lg:items-start lg:gap-12 lg:px-8 lg:pt-10">
        {/* ── Left Panel ── */}
        <div className="flex-1 lg:sticky lg:top-24">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {isIndividual ? (
              <>Welcome to <span className="text-brand-600">EcoCycle</span></>
            ) : (
              <>Welcome <span className="text-brand-600">Business Seller!</span></>
            )}
          </h1>
          <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600">
            India&apos;s trusted marketplace for recyclable plastic.
            <br />
            Connect • Recycle • Earn.
          </p>

          {/* Illustration */}
          <div className="mt-6 w-full max-w-[380px] overflow-hidden rounded-2xl">
            <ImageWithFallback
              src={heroImg}
              alt="EcoCycle recycling illustration"
              className="h-auto w-full object-contain"
              fallback={<Recycle className="mx-auto h-20 w-20 text-brand-500" strokeWidth={1.5} />}
            />
          </div>

          {/* Benefits */}
          <ul className="mt-8 space-y-5">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100">
                  <Icon className="h-4.5 w-4.5 text-brand-600" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{desc}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Tagline */}
          <p className="mt-8 max-w-sm text-sm font-medium text-slate-600">
            Together, let&apos;s build a cleaner, greener tomorrow.
          </p>
        </div>

        {/* ── Right Panel — Login Form ── */}
        <div className="w-full max-w-lg lg:flex-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {/* Header */}
            <div className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
                {isIndividual ? (
                  <User className="h-7 w-7 text-brand-600" strokeWidth={1.8} />
                ) : (
                  <Building2 className="h-7 w-7 text-brand-600" strokeWidth={1.8} />
                )}
              </span>
              <h2 className="mt-4 text-xl font-extrabold text-slate-900">Welcome Back!</h2>
              <p className="mt-1 text-sm text-slate-500">
                Login to continue to your {isIndividual ? 'seller' : 'business'} account
              </p>
            </div>

            {/* Toggle */}
            <div className="mt-6 flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setLoginType('individual')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  isIndividual
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <User className="h-4 w-4" />
                Individual Seller
              </button>
              <button
                type="button"
                onClick={() => setLoginType('business')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  !isIndividual
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Building2 className="h-4 w-4" />
                Business Seller
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Form */}
            <form className="mt-6 space-y-4" onSubmit={handleLogin}>
              {isIndividual ? (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Email or Phone Number
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Enter your email or phone number"
                        value={individualForm.email}
                        onChange={(e) => setIndividualForm((p) => ({ ...p, email: e.target.value }))}
                        required
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={individualForm.password}
                        onChange={(e) => setIndividualForm((p) => ({ ...p, password: e.target.value }))}
                        required
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-11 text-sm text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                      />
                      <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Business Email ID</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        placeholder="Enter your business email"
                        value={businessForm.email}
                        onChange={(e) => setBusinessForm((p) => ({ ...p, email: e.target.value }))}
                        required
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={businessForm.password}
                        onChange={(e) => setBusinessForm((p) => ({ ...p, password: e.target.value }))}
                        required
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-11 text-sm text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                      />
                      <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Business GST Number <span className="font-normal text-slate-400">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Enter your GST number"
                        value={businessForm.gst}
                        onChange={(e) => setBusinessForm((p) => ({ ...p, gst: e.target.value }))}
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Remember me + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-brand-600"
                  />
                  Remember me
                </label>
                <a href="#" className="text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800">
                  Forgot Password?
                </a>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-deep py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-deeper disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Recycle className="h-4 w-4" />
                )}
                {loading ? 'Logging in...' : isIndividual ? 'Login' : 'Login as Business Seller'}
              </button>
            </form>

            {/* Terms */}
            <p className="mt-5 text-center text-xs text-slate-500">
              By logging in, you agree to our{' '}
              <a href="#" className="font-semibold text-brand-700 underline underline-offset-2">Terms & Conditions</a>
              {' '}and{' '}
              <a href="#" className="font-semibold text-brand-700 underline underline-offset-2">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
