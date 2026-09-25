import { CheckCircle2 } from 'lucide-react'

export default function SellerTypeCard({
  icon: Icon,
  title,
  description,
  badge,
  selected,
  onSelect,
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex flex-col items-center rounded-2xl border-2 p-8 text-center transition-all ${
        selected
          ? 'border-brand-600 bg-brand-50/50 shadow-md shadow-brand-600/10'
          : 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-sm'
      }`}
    >
      {selected && (
        <CheckCircle2 className="absolute right-4 top-4 h-6 w-6 text-brand-600" />
      )}

      <span
        className={`flex h-16 w-16 items-center justify-center rounded-full ${
          selected ? 'bg-brand-100' : 'bg-slate-100'
        }`}
      >
        <Icon
          className={`h-8 w-8 ${selected ? 'text-brand-600' : 'text-slate-500'}`}
          strokeWidth={1.8}
        />
      </span>

      <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>

      <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-slate-500">
        {description}
      </p>

      {badge && (
        <span
          className={`mt-4 rounded-lg border px-4 py-2 text-xs font-semibold ${
            selected
              ? 'border-brand-600 text-brand-700'
              : 'border-slate-300 text-slate-600'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  )
}
