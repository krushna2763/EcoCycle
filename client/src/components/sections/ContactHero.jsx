import { ArrowRight, Headphones, Heart, Leaf, Mail } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import ImageWithFallback from '../common/ImageWithFallback'
import heroImg from '../../assets/hero-contact.png'

const FEATURES = [
  {
    icon: Headphones,
    title: 'Quick Support',
    description: 'We typically respond within 24 hours.',
  },
  {
    icon: Mail,
    title: 'Reliable Assistance',
    description: 'Get help from our friendly team.',
  },
  {
    icon: Heart,
    title: 'We Care',
    description: 'Your feedback helps us improve every day.',
  },
]

export default function ContactHero() {
  return (
    <section className="relative flex items-center overflow-hidden bg-gradient-to-b from-[#e2f4ea] to-white lg:min-h-[calc(100svh-5rem)]">
      <div className="mx-auto grid w-full max-w-app items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-24">
        {/* Left column */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700">
            <Leaf className="h-4 w-4" strokeWidth={2.5} />
            Contact Us
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl xl:text-[3.5rem]">
            We&apos;re here to{' '}
            <span className="text-brand-600">help!</span>{' '}
            <Leaf
              className="mb-1 inline-block h-9 w-9 text-brand-500"
              strokeWidth={2.5}
            />
          </h1>

          <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600">
            Have a question, suggestion, or need support?
            <br />
            Our team is always ready to assist you.
          </p>

          <Link
            to="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-xl border-2 border-brand-600 px-6 py-3 text-[15px] font-semibold text-brand-700 transition-colors hover:bg-brand-50"
          >
            <Mail className="h-4 w-4" strokeWidth={2} />
            Get in Touch
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Feature badges */}
          <div className="mt-10 grid grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title}>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
                  <Icon className="h-6 w-6 text-brand-600" strokeWidth={1.8} />
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
          <div className="aspect-[1200/912] w-full max-w-[520px] overflow-hidden rounded-3xl bg-white shadow-lg shadow-slate-900/5 xl:max-w-[560px] 2xl:max-w-[600px]">
            <ImageWithFallback
              src={heroImg}
              alt="EcoCycle Contact - Green recycling bin with plastic bottles and leaves"
              className="h-full w-full object-cover"
              fallback={
                <Leaf
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
