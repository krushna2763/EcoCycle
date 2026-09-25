import { ArrowRight } from 'lucide-react'
import story1Img from '../../assets/impact/stories/story1.png'
import story2Img from '../../assets/impact/stories/story2.png'
import story3Img from '../../assets/impact/stories/story3.png'

const STORIES = [
  {
    quote:
      'EcoCycle helped me turn my waste collection work into a stable income. I can now support my family with pride.',
    name: 'Sunita Devi',
    role: 'Waste Collector, Pune',
    image: story1Img,
  },
  {
    quote:
      'Finding reliable sellers was never easy. EcoCycle made the process simple and transparent for my business.',
    name: 'Rohan Mehta',
    role: 'Plastic Recycler, Mumbai',
    image: story2Img,
  },
  {
    quote:
      'Together, we are reducing plastic waste and creating a cleaner, healthier planet for future generations.',
    name: 'EcoCycle Community',
    role: 'Collective Impact',
    image: story3Img,
  },
]

export default function ImpactStories() {
  return (
    <section className="mx-auto max-w-app px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Stories of Real Impact
        </h2>
        <span className="mx-auto mt-3 block h-1 w-12 rounded-full bg-brand-600" />
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {STORIES.map(({ quote, name, role, image }) => (
          <div
            key={name}
            className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Story image */}
            <div className="flex h-48 items-center justify-center overflow-hidden bg-slate-50">
              <img
                src={image}
                alt={name}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col p-6">
              <p className="flex-1 text-[15px] leading-relaxed text-slate-600">
                &ldquo;{quote}&rdquo;
              </p>
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-sm font-bold text-slate-900">{name}</p>
                <p className="mt-0.5 text-xs font-medium text-brand-600">
                  {role}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-brand-600 px-6 py-3 text-[15px] font-semibold text-brand-700 transition-colors hover:bg-brand-50"
        >
          View More Stories
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  )
}
