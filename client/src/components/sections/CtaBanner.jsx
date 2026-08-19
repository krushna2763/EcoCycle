import { Leaf } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import ImageWithFallback from '../common/ImageWithFallback'
import seedingSoilImg from '../../assets/seeding-soil.jpg'

export default function CtaBanner() {
  return (
    <section className="mx-auto max-w-app px-4 pb-20 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-8 rounded-3xl bg-brand-deep px-8 py-10 text-center md:flex-row md:text-left lg:px-12">
        {/* Seedling illustration */}
        <div className="hidden shrink-0 md:block">
          <div className="h-28 w-28 overflow-hidden rounded-2xl">
            <ImageWithFallback
              src={seedingSoilImg}
              alt="Seedling sprouting from soil"
              className="h-full w-full object-cover"
              fallback={
                <Leaf className="h-12 w-12 text-brand-300" strokeWidth={1.5} />
              }
            />
          </div>
        </div>

        {/* Text */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Be a part of the change.
          </h2>
          <p className="mt-2 text-brand-100">
            Join EcoCycle and help build a cleaner, greener and better tomorrow.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col items-center gap-2">
          <Link
            to="/signup"
            className="rounded-xl bg-white px-6 py-3 text-[15px] font-semibold text-brand-deep shadow-sm transition-colors hover:bg-brand-50"
          >
            Register as Seller
          </Link>
          <span className="text-sm text-brand-200">or</span>
          <Link
            to="/signup"
            className="text-sm font-semibold text-white underline underline-offset-4 transition-colors hover:text-brand-100"
          >
            Register as Buyer
          </Link>
        </div>
      </div>
    </section>
  )
}
