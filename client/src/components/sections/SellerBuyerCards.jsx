import { ArrowRight, CheckCircle2, Recycle, UserRound } from 'lucide-react'
import ImageWithFallback from '../common/ImageWithFallback'
import sellerImg from '../../assets/seller.jpg'
import buyerImg from '../../assets/buyer.jpg'

const SELLER_POINTS = [
  'Free to list',
  'Reach verified buyers',
  'Quick & easy process',
]

const BUYER_POINTS = [
  'Verified sellers',
  'Quality materials',
  'Best market prices',
]

export default function SellerBuyerCards() {
  return (
    <section className="mx-auto max-w-app px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Seller card */}
        <div className="flex items-center gap-6 overflow-hidden rounded-3xl bg-brand-50 p-8">
          <div className="min-w-0 flex-1">
            <h3 className="text-2xl font-extrabold tracking-tight text-brand-700">
              Are You a Seller?
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
              List your waste and connect with verified buyers near you.
            </p>
            <ul className="mt-4 space-y-2">
              {SELLER_POINTS.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-600" />
                  {point}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-deep px-6 py-3 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-deeper"
            >
              Register as Seller
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="hidden w-52 shrink-0 sm:block">
            <div className="aspect-[1008/800] w-52 overflow-hidden rounded-2xl">
              <ImageWithFallback
                src={sellerImg}
                alt="Seller holding a recycling bin filled with bottles"
                className="h-full w-full object-cover"
                fallback={
                  <Recycle
                    className="h-16 w-16 text-brand-400"
                    strokeWidth={1.5}
                  />
                }
              />
            </div>
          </div>
        </div>

        {/* Buyer card */}
        <div className="flex items-center gap-6 overflow-hidden rounded-3xl bg-blue-50 p-8">
          <div className="min-w-0 flex-1">
            <h3 className="text-2xl font-extrabold tracking-tight text-blue-700">
              Are You a Buyer?
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
              Find quality recyclable materials from trusted sellers.
            </p>
            <ul className="mt-4 space-y-2">
              {BUYER_POINTS.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600" />
                  {point}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Register as Buyer
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="hidden w-52 shrink-0 sm:block">
            <div className="aspect-[1008/800] w-52 overflow-hidden rounded-2xl">
              <ImageWithFallback
                src={buyerImg}
                alt="Buyer with a clipboard next to stacked boxes and bottles"
                className="h-full w-full object-cover"
                fallback={
                  <UserRound
                    className="h-16 w-16 text-blue-400"
                    strokeWidth={1.5}
                  />
                }
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
