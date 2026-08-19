import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import Logo from '../common/Logo'

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

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-app items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === '/' }}
              activeProps={{
                className: 'border-brand-600 font-semibold text-brand-700',
              }}
              className="border-b-2 border-transparent pb-1 text-[15px] font-medium text-slate-600 transition-colors hover:text-brand-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/login"
            className="rounded-xl border border-brand-600 px-5 py-2.5 text-[15px] font-semibold text-brand-700 transition-colors hover:bg-brand-50"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="rounded-xl bg-brand-deep px-5 py-2.5 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-deeper"
          >
            Sign Up
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white px-4 pb-6 pt-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-3">
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-brand-600 px-5 py-2.5 text-center text-[15px] font-semibold text-brand-700"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              onClick={() => setOpen(false)}
              className="rounded-xl bg-brand-deep px-5 py-2.5 text-center text-[15px] font-semibold text-white"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
