import { useEffect, useState } from 'react'
import { Link, useMatchRoute } from '@tanstack/react-router'
import { Leaf, Menu, Recycle, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Categories', to: '/categories' },
  { label: 'Impact', to: '/impact' },
  { label: 'Contact', to: '/contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const matchRoute = useMatchRoute()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      {/* ── Desktop navbar ── */}
      <div
        className={`hidden w-full border-b border-slate-200/70 bg-white/80 shadow-lg shadow-slate-900/5 backdrop-blur-xl transition-all duration-300 lg:flex ${
          scrolled ? 'h-14' : 'h-[4.25rem]'
        }`}
      >
        <div className="mx-auto flex w-full max-w-app items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 shadow-sm">
            <Recycle className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
          </span>
          <span className="text-xl font-bold tracking-tight text-brand-800">
            EcoCycle
          </span>
        </Link>

        {/* Pill navigation */}
        <nav className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-100/60 px-2 py-1.5">
          {NAV_LINKS.map((link) => {
            const isActive = matchRoute({
              to: link.to,
              fuzzy: link.to !== '/',
            })
            return (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: link.to === '/' }}
                className={`relative rounded-full px-5 py-1.5 text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-100 text-brand-700 shadow-sm'
                    : 'text-slate-600 hover:text-brand-700'
                }`}
              >
                {link.label}
                {isActive && (
                  <Leaf
                    className="absolute -right-0.5 -top-0.5 h-3 w-3 text-brand-400 opacity-60"
                    strokeWidth={2.5}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Auth buttons */}
        <div className="flex shrink-0 items-center gap-2.5">
          <Link
            to="/login"
            className="rounded-full border border-slate-300 bg-white px-5 py-2 text-[13px] font-semibold text-slate-700 transition-all hover:border-brand-400 hover:text-brand-700"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-brand-deep px-5 py-2 text-[13px] font-semibold text-white shadow-md shadow-brand-deep/20 transition-all hover:bg-brand-deeper hover:shadow-lg"
          >
            Sign Up
          </Link>
        </div>
        </div>
      </div>

      {/* ── Mobile navbar ── */}
      <div
        className={`flex w-full items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 shadow-lg shadow-slate-900/5 backdrop-blur-xl transition-all duration-300 sm:px-6 lg:hidden ${
          scrolled ? 'h-14' : 'h-16'
        }`}
      >
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 shadow-sm">
            <Recycle className="h-4 w-4 text-white" strokeWidth={2.5} />
          </span>
          <span className="text-lg font-bold tracking-tight text-brand-800">
            EcoCycle
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-brand-50 hover:text-brand-700"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ── Mobile dropdown ── */}
      {open && (
        <div className="px-4 pt-2 sm:px-6 lg:hidden">
        <div className="mx-auto max-w-app overflow-hidden rounded-2xl border border-white/60 bg-white/95 p-4 shadow-xl shadow-slate-900/10 backdrop-blur-xl">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = matchRoute({
                to: link.to,
                fuzzy: link.to !== '/',
              })
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 text-[15px] font-medium transition-all ${
                    isActive
                      ? 'bg-brand-100 text-brand-700 shadow-sm'
                      : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700'
                  }`}
                >
                  {isActive && (
                    <Leaf
                      className="h-4 w-4 text-brand-500"
                      strokeWidth={2.5}
                    />
                  )}
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-4 flex flex-col gap-2.5 border-t border-slate-100 pt-4">
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-[15px] font-semibold text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-700"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              onClick={() => setOpen(false)}
              className="rounded-xl bg-brand-deep px-5 py-3 text-center text-[15px] font-semibold text-white shadow-md shadow-brand-deep/20 transition-colors hover:bg-brand-deeper"
            >
              Sign Up
            </Link>
          </div>
        </div>
        </div>
      )}
    </header>
  )
}
