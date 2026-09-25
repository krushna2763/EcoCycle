import { Link } from '@tanstack/react-router'
import { Leaf, ArrowLeft, Recycle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8faf8] px-4">
      <div className="text-center">
        <div className="relative mx-auto mb-6">
          <span className="text-8xl font-extrabold text-brand-100">404</span>
          <Recycle className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-brand-400" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Page Not Found</h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deeper"
          >
            <Leaf className="h-4 w-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
