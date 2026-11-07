import { Info } from 'lucide-react'

export function DemoNotice({
  className = '',
  inline = false,
}: {
  className?: string
  inline?: boolean
}) {
  if (inline) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs text-warm-600 font-medium bg-warm-100 px-2.5 py-1 rounded-full border border-warm-300 ${className}`}>
        <Info className="w-3.5 h-3.5 text-forest-700" />
        <span>Demonstration Dataset</span>
      </span>
    )
  }

  return (
    <div
      role="region"
      aria-label="Demonstration Notice"
      className={`bg-forest-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-forest-900 ${className}`}
    >
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-forest-800 shrink-0" />
        <p>
          <strong className="font-semibold text-forest-950">Demonstration Mode:</strong> You are viewing simulated scholarship records and an applicant prototype profile (Elena Rostova) for UI evaluation. No actual financial aid applications are submitted.
        </p>
      </div>
      <span className="text-[11px] font-mono font-medium text-forest-700 px-2 py-0.5 bg-white/80 rounded border border-emerald-200 shrink-0 hidden sm:inline-block">
        Simulated Data
      </span>
    </div>
  )
}
