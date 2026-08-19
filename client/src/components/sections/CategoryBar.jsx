import {
  CupSoda,
  Cylinder,
  FileText,
  GlassWater,
  LayoutGrid,
  Leaf,
  Monitor,
  Shirt,
} from 'lucide-react'

const CATEGORIES = [
  { label: 'Plastic', icon: CupSoda },
  { label: 'Paper', icon: FileText },
  { label: 'Metal', icon: Cylinder },
  { label: 'Glass', icon: GlassWater },
  { label: 'E-Waste', icon: Monitor },
  { label: 'Organic', icon: Leaf },
  { label: 'Textile', icon: Shirt },
  { label: 'View All', icon: LayoutGrid },
]

export default function CategoryBar() {
  return (
    <section className="mx-auto max-w-app px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-lg shadow-slate-900/5">
        <div className="grid grid-cols-4 gap-1 sm:grid-cols-8">
          {CATEGORIES.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className="group flex flex-col items-center gap-2 rounded-xl bg-brand-50 px-2 py-4 transition-colors hover:bg-brand-100"
            >
              <Icon className="h-6 w-6 text-brand-600" strokeWidth={1.8} />
              <span className="text-[13px] font-semibold text-brand-700">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
