import { Link } from '@tanstack/react-router'
import { ArrowRight, Leaf, Recycle, ShoppingCart, Store } from 'lucide-react'
import ImageWithFallback from '../../components/common/ImageWithFallback'
import sellerImg from '../../assets/seller.jpg'
import buyerImg from '../../assets/buyer.jpg'

export default function Signup() {
  return (
    <section className="flex min-h-[calc(100svh-5rem)] items-center justify-center bg-gradient-to-b from-[#e2f4ea] to-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700">
            <Leaf className="h-4 w-4" strokeWidth={2.5} />
            Join EcoCycle
          </span>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Get Started with{' '}
            <span className="text-brand-600">EcoCycle</span>{' '}
            <Recycle className="mb-1 inline-block h-8 w-8 text-brand-500" strokeWidth={2.5} />
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-slate-600">
            Choose how you want to be a part of the recycling revolution.
            Register as a seller or buyer to start making an impact.
          </p>
        </div>

        {/* Two cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {/* Seller card */}
          <Link
            to="/register-seller"
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-brand-400 hover:shadow-lg"
          >
            {/* Image */}
            <div className="mx-auto mb-6 h-48 w-full max-w-[280px] overflow-hidden rounded-2xl">
              <ImageWithFallback
                src={sellerImg}
                alt="Seller recycling"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                fallback={
                  <Store className="mx-auto h-16 w-16 text-brand-400" strokeWidth={1.5} />
                }
              />
            </div>

            <h2 className="text-center text-xl font-bold text-slate-900">
              Register as <span className="text-brand-600">Seller</span>
            </h2>
            <p className="mt-3 text-center text-sm leading-relaxed text-slate-500">
              List your recyclable plastic waste and connect with verified
              buyers. Turn waste into value.
            </p>

            <div className="mt-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-xl border-2 border-brand-600 px-6 py-3 text-sm font-semibold text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <Store className="h-4 w-4" />
                Seller Registration
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>

          {/* Buyer card */}
          <Link
            to="/register-buyer"
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-blue-400 hover:shadow-lg"
          >
            {/* Image */}
            <div className="mx-auto mb-6 h-48 w-full max-w-[280px] overflow-hidden rounded-2xl">
              <ImageWithFallback
                src={buyerImg}
                alt="Buyer purchasing recyclables"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                fallback={
                  <ShoppingCart className="mx-auto h-16 w-16 text-blue-400" strokeWidth={1.5} />
                }
              />
            </div>

            <h2 className="text-center text-xl font-bold text-slate-900">
              Register as <span className="text-blue-600">Buyer</span>
            </h2>
            <p className="mt-3 text-center text-sm leading-relaxed text-slate-500">
              Find quality recyclable materials from trusted sellers.
              Get the best prices for your business.
            </p>

            <div className="mt-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-xl border-2 border-blue-600 px-6 py-3 text-sm font-semibold text-blue-700 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <ShoppingCart className="h-4 w-4" />
                Buyer Registration
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </div>

        {/* Already have account */}
        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-brand-700 underline underline-offset-4 transition-colors hover:text-brand-800"
          >
            Log In
          </Link>
        </p>
      </div>
    </section>
  )
}
