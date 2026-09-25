import { Recycle } from 'lucide-react'

const PLASTIC_TYPES = ['PET', 'HDPE', 'PVC', 'LDPE', 'PP', 'PS', 'Other']

export default function PlasticTypeChips({ selected, onChange }) {
  const toggle = (type) => {
    onChange(
      selected.includes(type)
        ? selected.filter((t) => t !== type)
        : [...selected, type],
    )
  }

  return (
    <div className="flex flex-wrap gap-3">
      {PLASTIC_TYPES.map((type) => {
        const isActive = selected.includes(type)
        return (
          <button
            key={type}
            type="button"
            onClick={() => toggle(type)}
            className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${
              isActive
                ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700'
            }`}
          >
            <Recycle
              className={`h-4 w-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`}
              strokeWidth={2}
            />
            {type}
          </button>
        )
      })}
    </div>
  )
}
