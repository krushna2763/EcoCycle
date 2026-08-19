import { Leaf, Recycle } from 'lucide-react'
import ImageWithFallback from '../common/ImageWithFallback'
import heroImg from '../../assets/hero-image-howItWorkPage.png'

export default function HowItWorksHero() {
  return (
    <section className="relative flex items-center overflow-hidden bg-gradient-to-b from-[#e2f4ea] to-white lg:min-h-[calc(100svh-5rem)]">
      <div className="mx-auto grid w-full max-w-app items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-24">
        {/* Left column — text */}
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl xl:text-[3.5rem]">
            How It Works
          </h1>
          <p className="mt-4 text-xl font-bold">
            <span className="text-brand-600">Simple steps,</span>{' '}
            <span className="text-slate-900">big impact.</span>{' '}
            <Leaf
              className="mb-1 inline-block h-6 w-6 text-brand-500"
              strokeWidth={2.5}
            />
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
            EcoCycle makes recycling easy for everyone. From listing your
            plastic waste to getting the best price — we connect you with
            trusted buyers in just a few steps.
          </p>
        </div>

        {/* Right column — illustration */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-[560px] overflow-hidden rounded-3xl bg-white shadow-lg shadow-slate-900/5 xl:max-w-[600px]">
            <ImageWithFallback
              src={heroImg}
              alt="Green recycling bin filled with bottles surrounded by green leaves"
              className="h-auto w-full"
              fallback={
                <Recycle
                  className="h-20 w-20 text-brand-500"
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
