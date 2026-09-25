import { CheckCircle2 } from 'lucide-react'

export default function BenefitsList({ benefits }) {
  return (
    <ul className="space-y-4">
      {benefits.map(({ icon: Icon, title, description }) => (
        <li key={title} className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100">
            <Icon className="h-4.5 w-4.5 text-brand-600" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">{title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              {description}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
