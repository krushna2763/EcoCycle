import { Globe, Heart, Leaf, Users } from 'lucide-react'
import livelihoodImg from '../../assets/impact/livelihood.png'
import lifeCycleImg from '../../assets/impact/lifeCycle.png'
import happyImg from '../../assets/impact/happy.png'
import earthImg from '../../assets/Earth.png'

const AREAS = [
  {
    icon: Globe,
    title: 'Cleaner Environment',
    description:
      'Reducing plastic pollution and protecting our ecosystems for a better tomorrow.',
    image: earthImg,
  },
  {
    icon: Users,
    title: 'Empowering Livelihoods',
    description:
      'Creating opportunities and steady income for waste collectors and small recyclers.',
    image: livelihoodImg,
  },
  {
    icon: Leaf,
    title: 'Supporting Circular Economy',
    description:
      'Promoting reuse, recycling and responsible consumption for a sustainable future.',
    image: lifeCycleImg,
  },
  {
    icon: Heart,
    title: 'Building Better Communities',
    description:
      'Together with communities and partners for a greener and healthier India.',
    image: happyImg,
  },
]

export default function ImpactAreas() {
  return (
    <section className="mx-auto max-w-app px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Our Impact Areas
        </h2>
        <span className="mx-auto mt-3 block h-1 w-12 rounded-full bg-brand-600" />
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {AREAS.map(({ icon: Icon, title, description, image }) => (
          <div
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
          >
            {image ? (
              <div className="mx-auto flex h-36 w-36 items-center justify-center">
                <img
                  src={image}
                  alt={title}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
                <Icon className="h-8 w-8 text-brand-600" strokeWidth={1.8} />
              </span>
            )}
            <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
