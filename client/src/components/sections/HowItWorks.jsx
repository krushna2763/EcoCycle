import { Box, Handshake, Truck, UserPlus } from 'lucide-react'

const STEPS = [
  {
    number: '1',
    title: 'Register',
    description: 'Sign up as a seller or buyer.',
    icon: UserPlus,
  },
  {
    number: '2',
    title: 'List or Search',
    description: 'List your waste or search what you need.',
    icon: Box,
  },
  {
    number: '3',
    title: 'Connect',
    description: 'Connect, negotiate and confirm.',
    icon: Handshake,
  },
  {
    number: '4',
    title: 'Pickup & Complete',
    description: 'Pickup, complete the deal and make an impact.',
    icon: Truck,
  },
]

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-app px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        How EcoCycle Works
      </h2>

      <div className="relative mt-14">
        {/* Dotted connector between the steps */}
        <div className="absolute left-[12.5%] right-[12.5%] top-8 hidden border-t-2 border-dashed border-brand-200 lg:block" />

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ number, title, description, icon: Icon }) => (
            <div
              key={number}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
                  <Icon className="h-7 w-7 text-brand-600" strokeWidth={2} />
                </span>
                <span className="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white shadow-sm ring-2 ring-white">
                  {number}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-slate-500">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
