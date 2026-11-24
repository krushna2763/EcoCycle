import { useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import {
  ArrowLeft,
  BarChart3,
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
  Users,
} from 'lucide-react'
import ImageWithFallback from '../../components/common/ImageWithFallback'
import heroImg from '../../assets/impact/livelihood.png'
import { useAuth } from '../../context/AuthContext'

const SELLER_BENEFITS = [
  { icon: ShieldCheck, title: 'Verified & Trusted', desc: 'All buyers are verified to ensure safe and secure transactions.' },
  { icon: ShoppingBag, title: 'Get the Best Value', desc: 'Receive competitive prices for your recyclable plastic waste.' },
  { icon: Truck, title: 'Hassle-free Pickup', desc: 'Schedule pickups at your convenience and track your orders easily.' },
]

const BUYER_BENEFITS = [
  { icon: ShieldCheck, title: 'Verified & Trusted', desc: 'All businesses are verified for safe and secure transactions.' },
  { icon: Store, title: 'Grow Your Business', desc: 'Connect with reliable sellers and source recyclable plastic near you.' },
  { icon: ShoppingBag, title: 'Best Market Prices', desc: 'Compare listings and send your own offer price per kg.' },
]

const ADMIN_BENEFITS = [
  { icon: ShieldCheck, title: 'Listing Moderation', desc: 'Review, approve, or reject seller waste listings with clear remarks.' },
  { icon: Users, title: 'User Management', desc: 'Monitor and manage registered sellers and buyers across the platform.' },
  { icon: BarChart3, title: 'Platform Analytics', desc: 'Track platform-wide recycling statistics, volumes, and requests.' },
]

// All roles sign in through the existing authentication API.
// The tab adapts the page UI and validates credentials/authorization.
const ROLES = {
  seller: {
    tab: 'Seller',
    icon: User,
    heading: <>Welcome to <span className="text-brand-600">EcoCycle</span></>,
    subtitle: 'Login to continue to your seller account',
    hint: 'For individual and business sellers',
    emailLabel: 'Email Address',
    emailPlaceholder: 'Enter your email',
    submit: 'Login as Seller',
    register: { to: '/register-seller', label: 'Register as a seller' },
    benefits: SELLER_BENEFITS,
  },
  buyer: {
    tab: 'Buyer',
    icon: Building2,
    heading: <>Welcome <span className="text-brand-600">Buyer!</span></>,
    subtitle: 'Login to continue to your buyer account',
    hint: 'For recycling companies and other buyers',
    emailLabel: 'Business Email',
    emailPlaceholder: 'Enter your business email',
    submit: 'Login as Buyer',
    register: { to: '/register-buyer', label: 'Register as a buyer' },
    benefits: BUYER_BENEFITS,
  },
  admin: {
    tab: 'Admin',
    icon: ShieldCheck,
    heading: <>EcoCycle <span className="text-brand-600">Admin Portal</span></>,
    subtitle: 'Login with administrative credentials',
    hint: 'Restricted to authorized system administrators',
    emailLabel: 'Administrator Email',
    emailPlaceholder: 'Enter admin email',
    submit: 'Login as Admin',
    register: null,
    benefits: ADMIN_BENEFITS,
  },
}

export default function Login() {
  const { role: requestedRole } = useSearch({ strict: false })
  const [loginType, setLoginType] = useState(
    requestedRole === 'admin' ? 'admin' : requestedRole === 'buyer' ? 'buyer' : 'seller'
  )
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  const navigate = useNavigate()
  const { login, logout } = useAuth()
  const role = ROLES[loginType] || ROLES.seller
  const RoleIcon = role.icon

  const switchRole = (next) => {
    setLoginType(next)
    setError('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await login(form.email.trim(), form.password)

      // If user attempted Admin Login, verify role is strictly admin
      if (loginType === 'admin') {
        if (data.seller?.role !== 'admin') {
          // Immediately revoke session so non-admin account is not logged in under admin portal
          logout()
          setError('You are not authorized to access the admin dashboard.')
          return
        }
        navigate({ to: '/admin/dashboard' })
        return
      }

      // Role-based redirect to dashboard for standard user logins
      if (data.seller?.role === 'admin') {
        navigate({ to: '/admin/dashboard' })
      } else if (data.seller?.role === 'buyer') {
        navigate({ to: '/buyer/dashboard' })
      } else {
        navigate({ to: '/seller/dashboard' })
      }
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8faf8]">
      {/* ── Main ── */}
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-16 pt-6 lg:flex-row lg:items-start lg:gap-12 lg:px-8 lg:pt-10">
        {/* ── Left Panel ── */}
        <div className="flex-1 lg:sticky lg:top-24">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {role.heading}
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
            {role.benefits.map(({ icon: Icon, title, desc }) => (
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
                <RoleIcon className="h-7 w-7 text-brand-600" strokeWidth={1.8} />
              </span>
              <h2 className="mt-4 text-xl font-extrabold text-slate-900">
                {loginType === 'admin' ? 'Admin Portal' : 'Welcome Back!'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{role.subtitle}</p>
            </div>

            {/* 3-Way Role Toggle */}
            <div className="mt-6 flex gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1">
              {Object.entries(ROLES).map(([key, { tab, icon: TabIcon }]) => {
                const active = loginType === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => switchRole(key)}
                    aria-pressed={active}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                      active
                        ? 'bg-white text-brand-700 shadow-sm ring-1 ring-slate-200/50'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                    }`}
                  >
                    <TabIcon className="h-4 w-4 shrink-0" />
                    <span>{tab}</span>
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-center text-xs text-slate-400">{role.hint}</p>

            {/* Error banner */}
            {error && (
              <div
                role="alert"
                className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700 border border-red-200"
              >
                {error}
              </div>
            )}

            {/* Form */}
            <form className="mt-6 space-y-4" onSubmit={handleLogin}>
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  {role.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder={role.emailPlaceholder}
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-11 text-sm text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              {/* Remember me + Forgot Password */}
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

              {/* Login submit button */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-deep py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-deeper disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : loginType === 'admin' ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <Recycle className="h-4 w-4" />
                )}
                {loading ? 'Logging in...' : role.submit}
              </button>
            </form>

            {/* Bottom Options */}
            {loginType === 'admin' ? (
              <div className="mt-5 space-y-3 text-center">
                <button
                  type="button"
                  onClick={() => switchRole('seller')}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to User Login
                </button>
                <p className="text-xs text-slate-400">
                  Administrative access is restricted to authorized platform personnel.
                </p>
              </div>
            ) : (
              <>
                <p className="mt-4 text-center text-sm text-slate-500">
                  Don&apos;t have an account?{' '}
                  <Link to={role.register.to} className="font-semibold text-brand-700 hover:text-brand-800">
                    {role.register.label}
                  </Link>
                </p>

                <div className="mt-3 border-t border-slate-100 pt-3 text-center">
                  <button
                    type="button"
                    onClick={() => switchRole('admin')}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-brand-700"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Are you an administrator? Switch to Admin Login
                  </button>
                </div>
              </>
            )}

            {/* Terms */}
            <p className="mt-5 text-center text-xs text-slate-400">
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
