import { Fragment } from 'react'
import { ChevronDown, ChevronRight, ShieldCheck, Wallet } from 'lucide-react'
import ImageWithFallback from '../common/ImageWithFallback'
import process1 from '../../assets/ecocycleprocess1.png'
import process2 from '../../assets/ecocycleprocess2.png'
import process3 from '../../assets/ecocycleprocess3.png'
import process4 from '../../assets/ecocycleprocess4.png'
import process5 from '../../assets/ecocycleprocess5.png'

const STEPS = [
  {
    number: '1',
    title: 'Create Your Account',
    description: 'Sign up as a seller or buyer in just a few seconds.',
    img: process1,
  },
  {
    number: '2',
    title: 'List Your Plastic Waste',
    description: 'Add details like type, quantity, location and upload photos.',
    img: process2,
  },
  {
    number: '3',
    title: 'Receive Offers',
    description: 'Buyers near you will send their best offers for your waste.',
    img: process3,
  },
  {
    number: '4',
    title: 'Accept & Schedule Pickup',
    description: 'Accept the best offer and schedule a convenient pickup.',
    img: process4,
  },
  {
    number: '5',
    title: 'Get Paid',
    description:
      'Once the waste is picked up and verified, you get paid securely.',
    img: process5,
  },
]

function StepArrow() {
  return (
    <div className="shrink-0 self-center py-1">
      <ChevronDown className="mx-auto h-6 w-6 text-brand-400 lg:hidden" />
      <div className="hidden items-center lg:flex">
        <div className="h-0 w-8 border-t-2 border-dashed border-brand-400" />
        <ChevronRight className="-ml-2 h-6 w-6 text-brand-400" />
      </div>
    </div>
  )
}

export default function ProcessSteps() {
  return (
    <section className="mx-auto max-w-app px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-brand-700 sm:text-4xl">
          The EcoCycle Process
        </h2>
        <span className="mx-auto mt-3 block h-1 w-12 rounded-full bg-brand-600" />
      </div>

      {/* Steps */}
      <div className="mt-14 flex flex-col lg:flex-row lg:items-stretch">
        {STEPS.map((step, index) => (
          <Fragment key={step.number}>
            {index > 0 && <StepArrow />}
            <div className="relative flex-1 rounded-2xl border border-slate-200 bg-white p-5 pt-6 shadow-sm">
              <span className="absolute -top-3 left-5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-deep text-sm font-bold text-white shadow-sm">
                {step.number}
              </span>
              <div className="mt-2 flex h-[145px] items-center justify-center overflow-hidden rounded-xl bg-brand-50">
                {step.img ? (
                  <ImageWithFallback
                    src={step.img}
                    alt={step.title}
                    className="h-full w-full object-contain"
                    fallback={
                      <Wallet
                        className="h-14 w-14 text-brand-500"
                        strokeWidth={1.5}
                      />
                    }
                  />
                ) : (
                  <Wallet
                    className="h-14 w-14 text-brand-500"
                    strokeWidth={1.5}
                  />
                )}
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-800">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {step.description}
              </p>
            </div>
          </Fragment>
        ))}
      </div>

      {/* Trust banner */}
      <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl bg-brand-50 px-8 py-6 text-center sm:flex-row sm:gap-5 sm:text-left">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100">
          <ShieldCheck className="h-6 w-6 text-brand-700" strokeWidth={2} />
        </span>
        <div>
          <p className="text-base font-bold text-brand-700">
            Safe, Transparent &amp; Reliable
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            We ensure verified users, secure transactions and a smooth
            experience for both sellers and buyers.
          </p>
        </div>
      </div>
    </section>
  )
}
