import { Globe } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import ImageWithFallback from '../common/ImageWithFallback'
import earthImg from '../../assets/Earth.png'

export default function ProcessCta() {
  return (
    <section className="mx-auto max-w-app px-4 pb-20 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-8 rounded-3xl bg-brand-deep px-8 py-10 text-center md:flex-row md:gap-12 md:text-left lg:px-12">
        {/* Globe illustration */}
        <div className="hidden shrink-0 md:block">
          <div className="aspect-[1536/1024] w-48 overflow-hidden rounded-2xl">
            <ImageWithFallback
              src={earthImg}
              alt="Green globe surrounded by leaves"
              className="h-full w-full object-cover"
              fallback={
                <Globe
                  className="h-14 w-14 text-brand-300"
                  strokeWidth={1.5}
                />
              }
            />
          </div>
        </div>

        {/* Text */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Be a Part of the Change
          </h2>
          <p className="mt-2 leading-relaxed text-white/85">
            Join thousands of people who are already making a difference with
            EcoCycle.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col items-center gap-3">
          <Link
            to="/register-seller"
            className="rounded-xl bg-white px-6 py-3 text-[15px] font-semibold text-brand-deep shadow-sm transition-colors hover:bg-brand-50"
          >
            Register as a Seller
          </Link>
          <span className="text-sm text-white/80">or</span>
          <Link
            to="/register-seller"
            className="rounded-xl border-2 border-white px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
          >
            Register as a Buyer
          </Link>
        </div>
      </div>
    </section>
  )
}
