import { Recycle, Store, Users, MapPin } from 'lucide-react'

const STATS = [
  {
    value: '1,250+',
    title: 'Tons of Plastic Recycled',
    description: 'Keeping plastic out of landfills and oceans.',
    icon: Recycle,
  },
  {
    value: '25,000+',
    title: 'Happy Sellers',
    description: 'Waste collectors and individuals earning better every day.',
    icon: Users,
  },
  {
    value: '5,000+',
    title: 'Verified Buyers',
    description: 'Businesses and recyclers trusting EcoCycle.',
    icon: Store,
  },
  {
    value: '120+',
    title: 'Cities Covered',
    description: 'Expanding our green network across India.',
    icon: MapPin,
  },
]

export default function ImpactStats() {
  return (
    <section className="mx-auto max-w-app px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="rounded-3xl bg-brand-50 px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map(({ value, title, description, icon: Icon }) => (
            <div key={title} className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100">
                <Icon className="h-7 w-7 text-brand-600" strokeWidth={2} />
              </span>
              <p className="mt-5 text-4xl font-extrabold tracking-tight text-brand-700">
                {value}
              </p>
              <p className="mt-2 text-sm font-bold text-brand-600">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
