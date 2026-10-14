import { ChevronLeft, ChevronRight } from 'lucide-react'

const ACTIVE = {
  brand: 'bg-brand-deep text-white',
  blue: 'bg-blue-600 text-white',
}

// Page buttons with previous/next; shows a window of pages around the current one
export default function Pagination({ page, pages, onChange, accent = 'brand' }) {
  if (pages <= 1) return null
  const start = Math.max(1, Math.min(page - 2, pages - 4))
  const numbers = Array.from({ length: Math.min(5, pages) }, (_, i) => start + i)

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        aria-label="Previous page"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {numbers.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          aria-current={n === page ? 'page' : undefined}
          className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
            n === page ? ACTIVE[accent] : 'border border-slate-200 font-medium text-slate-600 hover:bg-slate-50'
          }`}
        >
          {n}
        </button>
      ))}
      <button
        aria-label="Next page"
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
