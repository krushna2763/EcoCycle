import { Leaf } from 'lucide-react'
import ImageWithFallback from '../common/ImageWithFallback'
import storyHandsImg from '../../assets/story-hands.jpg'

const PARAGRAPHS = [
  'EcoCycle was born out of a simple belief — waste is not worthless. It can create value, support livelihoods and protect our environment.',
  'We saw millions of tons of plastic waste being dumped every day while many waste collectors struggled to find genuine buyers.',
  'So, we built EcoCycle — a platform that brings transparency, trust and technology to the recycling ecosystem.',
]

export default function OurStory() {
  return (
    <section className="mx-auto max-w-app px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* Text */}
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Our Story
          </h2>
          <span className="mt-3 block h-1 w-12 rounded-full bg-brand-600" />
          <div className="mt-6 space-y-4">
            {PARAGRAPHS.map((paragraph, index) => (
              <p
                key={index}
                className="text-[15px] leading-relaxed text-slate-600"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Image */}
        <div>
          <div className="aspect-[3/2] w-full overflow-hidden rounded-3xl shadow-lg shadow-slate-900/5">
            <ImageWithFallback
              src={storyHandsImg}
              alt="Two hands cupping a small glowing green globe"
              className="h-full w-full object-cover"
              fallback={
                <Leaf
                  className="h-20 w-20 text-brand-500"
                  strokeWidth={1.5}
                />
              }
            />
          </div>
        </div>
      </div>
    </section>
  )
}
