import { IndianRupee, Leaf, Recycle, ShieldCheck } from 'lucide-react'
import ImageWithFallback from '../common/ImageWithFallback'
import heroImg from '../../assets/hero-recycling.jpg'

const FEATURES = [
  {
    icon: ShieldCheck,
    title: '100% Verified Buyers',
    description: 'All buyers are verified for safe transactions.',
  },
  {
    icon: IndianRupee,
    title: 'Best Price Guarantee',
    description: 'Get competitive prices for your plastic waste.',
  },
  {
    icon: Leaf,
    title: 'Sustainable Impact',
    description: 'Every sale contributes to a cleaner environment.',
  },
]

export default function CategoriesHero() {
  return (
    <section className="relative flex items-center overflow-hidden bg-gradient-to-b from-[#e2f4ea] to-white lg:min-h-[calc(100svh-5rem)]">
      <div className="mx-auto grid w-full max-w-app items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-24">
        {/* Left column */}
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl xl:text-[3.5rem]">
            Our Categories{' '}
            <Leaf
              className="mb-1 inline-block h-9 w-9 text-brand-500"
              strokeWidth={2.5}
            />
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
            Sell any type of recyclable plastic and get the best prices from
            trusted buyers.
          </p>
          <span className="mt-5 block h-1 w-14 rounded-full bg-brand-600" />

          {/* Feature items */}
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title}>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100">
                  <Icon className="h-5 w-5 text-brand-700" strokeWidth={2} />
                </span>
                <h3 className="mt-3 text-sm font-bold text-slate-900">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — illustration */}
        <div className="flex justify-center lg:justify-end">
          <div className="aspect-[1200/912] w-full max-w-[520px] overflow-hidden rounded-3xl bg-white shadow-lg shadow-slate-900/5 xl:max-w-[560px]">
            <ImageWithFallback
              src={heroImg}
              alt="Green recycling bin filled with plastic bottles"
              className="h-full w-full object-cover"
              fallback={
                <Recycle
                  className="h-28 w-28 text-brand-500"
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
