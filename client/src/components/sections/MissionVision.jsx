import { Leaf } from 'lucide-react'

export default function MissionVision() {
  return (
    <section className="mx-auto max-w-app px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid items-center gap-10 rounded-3xl border border-slate-100 bg-white p-8 shadow-lg shadow-slate-900/5 md:grid-cols-[1fr_auto_1fr] lg:p-12">
        {/* Mission */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Our Mission
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
            To build a sustainable ecosystem where plastic waste is responsibly
            collected, recycled and reused—creating value for communities and a
            better future for our planet.
          </p>
        </div>

        {/* Center badge */}
        <div className="flex justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-brand-200 bg-brand-50">
            <Leaf className="h-7 w-7 text-brand-600" strokeWidth={2} />
          </span>
        </div>

        {/* Vision */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Our Vision
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
            To become the most trusted and impactful recycling platform, driving
            a cleaner, greener and circular economy for generations to come.
          </p>
        </div>
      </div>
    </section>
  )
}
