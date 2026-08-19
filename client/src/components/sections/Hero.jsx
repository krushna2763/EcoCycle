import { Check, Leaf, Lock, Recycle, ShoppingBag, Store } from 'lucide-react'
import ImageWithFallback from '../common/ImageWithFallback'
import heroImg from '../../assets/hero-recycling.jpg'

const BADGES = [
  { icon: Check, label: 'Verified Users' },
  { icon: Lock, label: 'Secure Transactions' },
  { icon: Leaf, label: 'Better Environment' },
]

export default function Hero() {
  return (
    <section className="relative flex items-center overflow-hidden bg-gradient-to-b from-[#e2f4ea] to-white lg:min-h-[calc(100svh-5rem)]">
      <div className="relative mx-auto grid w-full max-w-app items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-24">
        {/* Left column */}
        <div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl xl:text-[3.5rem] 2xl:text-[3.75rem]">
            Turn Your Waste
            <br />
            into{' '}
            <span className="text-brand-600">Value</span>{' '}
            <Leaf
              className="mb-1 inline-block h-9 w-9 text-brand-500"
              strokeWidth={2.5}
            />
          </h1>

          <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-600 xl:max-w-lg">
            EcoCycle connects waste generators with
            <br />
            responsible recyclers. Clean Earth, Better Tomorrow.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              className="flex items-center gap-3 rounded-2xl bg-brand-deep px-6 py-4 text-left shadow-lg shadow-brand-deep/25 transition-colors hover:bg-brand-deeper"
            >
              <Store className="h-5 w-5 shrink-0 text-white" strokeWidth={2} />
              <span>
                <span className="block text-base font-bold text-white">
                  I&apos;m a Seller
                </span>
                <span className="block text-sm text-brand-100">
                  I want to sell waste
                </span>
              </span>
            </button>

            <button
              type="button"
              className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-6 py-4 text-left transition-colors hover:border-brand-400 hover:bg-brand-50/50"
            >
              <ShoppingBag
                className="h-5 w-5 shrink-0 text-brand-600"
                strokeWidth={2}
              />
              <span>
                <span className="block text-base font-bold text-slate-800">
                  I&apos;m a Buyer
                </span>
                <span className="block text-sm text-slate-500">
                  I want to buy waste
                </span>
              </span>
            </button>
          </div>

          {/* Badges */}
          <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            {BADGES.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 text-sm font-medium text-slate-600"
              >
                <Icon className="h-5 w-5 text-brand-600" strokeWidth={2} />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Right column — illustration */}
        <div className="flex justify-center lg:justify-end">
          <div className="aspect-[1200/912] w-full max-w-[520px] overflow-hidden rounded-3xl bg-white shadow-lg shadow-slate-900/5 xl:max-w-[560px] 2xl:max-w-[600px]">
            <ImageWithFallback
              src={heroImg}
              alt="Green recycling bin filled with bottles set against a cityscape"
              className="h-full w-full object-cover"
              fallback={
                <Recycle
                  className="h-28 w-28 text-brand-600"
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
