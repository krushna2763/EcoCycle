import { HeadphonesIcon } from 'lucide-react'

export default function DashboardHelp() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:justify-between">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50">
          <HeadphonesIcon className="h-6 w-6 text-brand-600" strokeWidth={1.8} />
        </span>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Need Help?</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Our support team is here to help you with any questions.
          </p>
        </div>
      </div>
      <button className="rounded-xl bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-deeper">
        Contact Support
      </button>
    </div>
  )
}
