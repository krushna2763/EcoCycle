import { Handshake, Leaf, Lightbulb, Users } from 'lucide-react'

const VALUES = [
  {
    icon: Leaf,
    title: 'Sustainability',
    description: 'We are committed to reducing waste and protecting our planet.',
  },
  {
    icon: Users,
    title: 'Integrity',
    description: 'We believe in honesty, transparency and fair practices.',
  },
  {
    icon: Handshake,
    title: 'Community',
    description: 'We empower individuals and communities to grow together.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'We use technology and innovation to build smart and simple solutions.',
  },
]

export default function CoreValues() {
  return (
    <section className="mx-auto max-w-app px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Our Core Values
        </h2>
        <span className="mx-auto mt-3 block h-1 w-12 rounded-full bg-brand-600" />
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm"
          >
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
              <Icon className="h-6 w-6 text-brand-600" strokeWidth={2} />
            </span>
            <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
