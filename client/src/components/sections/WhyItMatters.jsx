import { Globe, IndianRupee, Sprout, Users } from 'lucide-react'

const FEATURES = [
  {
    icon: Sprout,
    title: 'Reduces Pollution',
    description: 'Helps in reducing plastic waste and keeps our environment clean.',
  },
  {
    icon: Users,
    title: 'Supports Livelihoods',
    description:
      'Empowers waste collectors and small recyclers by connecting them to more buyers.',
  },
  {
    icon: IndianRupee,
    title: 'Better Prices',
    description:
      'Competitive offers help sellers get the best value for their plastic waste.',
  },
  {
    icon: Globe,
    title: 'Sustainable Future',
    description:
      'Every transaction contributes to a cleaner, greener and sustainable planet.',
  },
]

export default function WhyItMatters() {
  return (
    <section className="mx-auto max-w-app px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-brand-700 sm:text-4xl">
          Why It Matters
        </h2>
        <span className="mx-auto mt-3 block h-1 w-12 rounded-full bg-brand-600" />
      </div>

      <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-slate-200">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex flex-col items-center px-4 text-center lg:px-6"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
              <Icon className="h-6 w-6 text-brand-600" strokeWidth={2} />
            </span>
            <h3 className="mt-4 text-lg font-bold text-slate-800">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
