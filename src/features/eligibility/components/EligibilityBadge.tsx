import { CheckCircle2, HelpCircle, XCircle } from 'lucide-react'
import type { EligibilityAssessment, EligibilityStatus } from '../types/eligibility'

interface EligibilityBadgeProps {
  assessment?: EligibilityAssessment | null
  status?: EligibilityStatus
  matchScore?: number
  size?: 'sm' | 'md'
}

export function EligibilityBadge({
  assessment,
  status: propStatus,
  matchScore: propScore,
  size = 'md',
}: EligibilityBadgeProps) {
  const status = assessment?.status ?? propStatus ?? 'potential_match'
  const score = assessment?.matchScore ?? propScore ?? 0

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5'

  if (status === 'strong_match') {
    return (
      <span
        title={assessment?.summaryRationale || 'Strong eligibility match'}
        className={`inline-flex items-center font-semibold rounded-full bg-forest-50 text-forest-800 border border-emerald-200 select-none ${sizeClasses}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Strong Match {score > 0 && `(${score}%)`}</span>
      </span>
    )
  }

  if (status === 'potential_match') {
    return (
      <span
        title={assessment?.summaryRationale || 'Potential match - information needed'}
        className={`inline-flex items-center font-medium rounded-full bg-amber-50 text-amber-900 border border-amber-200 select-none ${sizeClasses}`}
      >
        <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>Potential Match {score > 0 && `(${score}%)`}</span>
      </span>
    )
  }

  return (
    <span
      title={assessment?.summaryRationale || 'Does not meet mandatory criteria'}
      className={`inline-flex items-center font-medium rounded-full bg-warm-100 text-warm-600 border border-warm-300 select-none ${sizeClasses}`}
    >
      <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
      <span>Not Eligible</span>
    </span>
  )
}
