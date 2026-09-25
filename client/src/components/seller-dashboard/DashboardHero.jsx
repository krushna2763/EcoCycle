import { PlusCircle } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import ImageWithFallback from '../common/ImageWithFallback'
import heroImg from '../../assets/seller dashboard/hero.png'
import { Recycle } from 'lucide-react'

export default function DashboardHero({ sellerName }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50/80 to-emerald-50/60 p-8 sm:p-10 lg:p-14">
      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        {/* Left content */}
        <div className="flex-1">
          <p className="text-lg text-slate-600">Welcome back,</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            {sellerName || 'Seller'}! 👋
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-500">
            List your plastic waste and connect with trusted recycling companies.
          </p>
          <Link
            to="/seller/dashboard/add-listing"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-deep px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-deeper"
          >
            <PlusCircle className="h-4 w-4" />
            Add Plastic Waste
          </Link>
        </div>

        {/* Right illustration */}
        <div className="hidden lg:flex lg:w-80 lg:justify-center">
          <div className="relative h-64 w-64">
            <ImageWithFallback
              src={heroImg}
              alt="EcoCycle recycling"
              className="h-full w-full object-contain"
              fallback={<Recycle className="h-24 w-24 text-brand-400" strokeWidth={1} />}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
