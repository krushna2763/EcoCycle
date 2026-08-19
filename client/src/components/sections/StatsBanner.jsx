import { BadgeCheck, ClipboardCheck, Recycle, Users } from 'lucide-react'

const STATS = [
  { value: '10K+', label: 'Happy Users', icon: Users },
  { value: '500+', label: 'Verified Buyers', icon: BadgeCheck },
  { value: '1K+', label: 'Waste Listings', icon: ClipboardCheck },
  { value: '250+ Tons', label: 'Waste Recycled', icon: Recycle },
]

export default function StatsBanner() {
  return (
    <section className="bg-gradient-to-b from-slate-100 to-white">
      <div className="mx-auto max-w-app px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <p className="text-center text-base font-medium text-slate-500 sm:text-lg">
          Join thousands of users making a difference every day.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl bg-white p-6 text-center shadow-md shadow-slate-900/5"
            >
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
                <Icon className="h-6 w-6 text-brand-600" strokeWidth={2} />
              </span>
              <p className="mt-4 text-3xl font-extrabold tracking-tight text-brand-700">
                {value}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
