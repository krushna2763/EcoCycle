import { ArrowRight, Recycle } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export default function ContactBanner() {
  return (
    <section className="mx-auto max-w-app px-4 pb-20 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-6 rounded-3xl bg-brand-50 px-8 py-8 text-center md:flex-row md:gap-8 md:text-left">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-100">
          <Recycle className="h-8 w-8 text-brand-700" strokeWidth={1.8} />
        </span>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900">
            Don&apos;t see your plastic type?
          </h2>
          <p className="mt-1 text-slate-600">
            We accept many other recyclable plastics. Contact us to know more!
          </p>
        </div>
        <Link
          to="/contact"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-deep px-6 py-3 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-deeper"
        >
          Contact Us
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
