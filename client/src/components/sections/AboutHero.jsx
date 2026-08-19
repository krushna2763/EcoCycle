import { Leaf, Recycle, ShieldCheck, Users } from 'lucide-react'
import ImageWithFallback from '../common/ImageWithFallback'
import aboutBinImg from '../../assets/about-bin.jpg'

const FEATURES = [
  {
    icon: Leaf,
    title: 'Sustainable',
    description: 'Promoting recycling and reducing plastic pollution.',
  },
  {
    icon: Users,
    title: 'Connected',
    description: 'Bridging the gap between waste generators and recyclers.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted',
    description: 'Verified users, secure transactions and fair practices.',
  },
]

export default function AboutHero() {
  return (
    <section className="relative flex items-center overflow-hidden bg-gradient-to-b from-[#e2f4ea] to-white lg:min-h-[calc(100svh-5rem)]">
      <div className="mx-auto grid w-full max-w-app items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-20">
        {/* Left column */}
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl xl:text-[3.5rem]">
            About Us
          </h1>
          <p className="mt-4 text-xl font-semibold text-slate-700">
            Building a cleaner tomorrow, together.{' '}
            <Leaf
              className="mb-1 inline-block h-6 w-6 text-brand-500"
              strokeWidth={2.5}
            />
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
            EcoCycle is a digital marketplace that connects people who generate
            plastic waste with trusted recyclers. We make recycling easy,
            transparent, and rewarding for everyone.
          </p>

          {/* Feature cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl bg-brand-50/70 p-4 shadow-sm"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                  <Icon className="h-5 w-5 text-brand-600" strokeWidth={2} />
                </span>
                <h3 className="mt-3 text-sm font-bold text-slate-900">
                  {title}
                </h3>
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
              src={aboutBinImg}
              alt="Green recycling bin filled with plastic bottles and bags"
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
