import { Leaf } from 'lucide-react'

export default function ComingSoon({ title }) {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
        <Leaf className="h-8 w-8 text-brand-600" />
      </span>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">
        {title}
      </h1>
      <p className="mt-3 text-slate-500">This page is coming soon.</p>
    </section>
  )
}
