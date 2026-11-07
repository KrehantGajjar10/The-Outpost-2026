import { CheckCircle2, XCircle, AlertTriangle, Info, Sparkles } from 'lucide-react'
import type { EligibilityAssessment } from '../types/eligibility'
import { Card } from '../../../components/ui/Card'
import { EligibilityBadge } from './EligibilityBadge'
import { Link } from 'react-router-dom'

interface EligibilityBreakdownCardProps {
  assessment: EligibilityAssessment
}

export function EligibilityBreakdownCard({ assessment }: EligibilityBreakdownCardProps) {
  return (
    <Card variant="default" className="p-5 space-y-4 bg-white border border-warm-300">
      {/* Header with status badge & match summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-warm-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
              Eligibility Assessment
            </span>
            <EligibilityBadge assessment={assessment} size="sm" />
          </div>
          <p className="text-xs font-medium text-warm-700 leading-relaxed">
            {assessment.summaryRationale}
          </p>
        </div>

        <Link
          to="/profile"
          className="text-xs font-semibold text-forest-800 hover:underline flex items-center gap-1 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Edit Profile</span>
        </Link>
      </div>

      {/* Criteria Breakdown Sections */}
      <div className="space-y-3 text-xs">
        {/* Satisfied Criteria */}
        {assessment.satisfiedCriteria.length > 0 && (
          <div className="space-y-2">
            <h5 className="font-bold text-forest-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Satisfied Requirements ({assessment.satisfiedCriteria.length})</span>
            </h5>
            <div className="space-y-1.5 pl-5">
              {assessment.satisfiedCriteria.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-forest-50/60 border border-emerald-100 space-y-0.5"
                >
                  <p className="font-semibold text-forest-900">{item.label}</p>
                  <p className="text-warm-700">{item.message}</p>
                  {item.studentValue && (
                    <p className="text-[11px] text-warm-500">
                      Your profile: <span className="font-mono">{item.studentValue}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Failed Criteria */}
        {assessment.failedCriteria.length > 0 && (
          <div className="space-y-2 pt-1">
            <h5 className="font-bold text-rose-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <XCircle className="w-4 h-4 text-rose-500" />
              <span>Unsatisfied Requirements ({assessment.failedCriteria.length})</span>
            </h5>
            <div className="space-y-1.5 pl-5">
              {assessment.failedCriteria.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200 space-y-0.5"
                >
                  <p className="font-semibold text-rose-950">
                    {item.label} {item.isMandatory && <span className="text-[10px] text-rose-600 font-bold uppercase">(Mandatory)</span>}
                  </p>
                  <p className="text-rose-900">{item.message}</p>
                  {item.requiredValue && (
                    <p className="text-[11px] text-rose-700">
                      Requirement: <span className="font-mono">{item.requiredValue}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Information Needed */}
        {assessment.missingInformation.length > 0 && (
          <div className="space-y-2 pt-1">
            <h5 className="font-bold text-amber-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Profile Information Still Needed ({assessment.missingInformation.length})</span>
            </h5>
            <div className="space-y-1.5 pl-5">
              {assessment.missingInformation.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 space-y-0.5"
                >
                  <p className="font-semibold text-amber-950">{item.label}</p>
                  <p className="text-amber-900">{item.message}</p>
                  <Link
                    to="/profile"
                    className="text-[11px] font-semibold text-forest-800 hover:underline inline-block pt-1"
                  >
                    Add this to your profile →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Disclaimers & Methodology */}
      <div className="pt-3 border-t border-warm-200 flex items-center gap-2 text-[11px] text-warm-500">
        <Info className="w-3.5 h-3.5 text-forest-700 shrink-0" />
        <p>{assessment.isEstimateNotice}</p>
      </div>
    </Card>
  )
}
