import { Recycle } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export default function Logo({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 ${className}`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 shadow-sm">
        <Recycle className="h-5 w-5 text-white" strokeWidth={2.5} />
      </span>
      <span className="text-2xl font-bold tracking-tight text-brand-800">
        EcoCycle
      </span>
    </Link>
  )
}
