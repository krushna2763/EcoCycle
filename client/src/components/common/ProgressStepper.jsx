import { Check } from 'lucide-react'

const STEPS = [
  { label: 'Account Information' },
  { label: 'Select Seller Type' },
  { label: 'Details' },
  { label: 'Verification' },
  { label: 'Complete' },
]

export default function ProgressStepper({ currentStep }) {
  return (
    <div className="flex items-center justify-between">
      {STEPS.map((step, i) => {
        const stepNum = i + 1
        const isCompleted = stepNum < currentStep
        const isActive = stepNum === currentStep
        const isFuture = stepNum > currentStep

        return (
          <div key={step.label} className="flex flex-1 items-center">
            {/* Circle + label */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  isCompleted
                    ? 'bg-brand-600 text-white'
                    : isActive
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                      : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" strokeWidth={3} />
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={`mt-2 hidden text-xs font-medium sm:block ${
                  isActive
                    ? 'text-brand-700'
                    : isCompleted
                      ? 'text-brand-600'
                      : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div className="mx-2 flex-1 px-2">
                <div
                  className={`h-0.5 w-full rounded-full ${
                    isCompleted ? 'bg-brand-600' : 'bg-slate-200'
                  }`}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
