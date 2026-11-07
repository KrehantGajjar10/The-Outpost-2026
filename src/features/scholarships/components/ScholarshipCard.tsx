import { Card } from '../../../components/ui/Card'
import { UrgencyBadge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { EligibilityBadge } from '../../eligibility/components/EligibilityBadge'
import { formatDisplayDate, calculateDaysRemaining, getUrgencyLevel } from '../../../lib/utils'
import { applicationService } from '../../applications/services/applicationService'
import type { Scholarship } from '../types/scholarship'
import type { EligibilityAssessment } from '../../eligibility/types/eligibility'
import { Building2, Calendar, Bookmark, ArrowUpRight, Globe, Layers } from 'lucide-react'

interface ScholarshipCardProps {
  scholarship: Scholarship
  assessment?: EligibilityAssessment
  isSaved: boolean
  onToggleSave: (id: string) => void
  onSelect: (scholarship: Scholarship) => void
}

export function ScholarshipCard({
  scholarship,
  assessment,
  isSaved,
  onToggleSave,
  onSelect,
}: ScholarshipCardProps) {
  const daysRemaining = calculateDaysRemaining(scholarship.deadline)
  const urgency = getUrgencyLevel(daysRemaining)
  const isTracked = applicationService.isScholarshipTracked(scholarship.id)

  const awardTypeLabel =
    scholarship.awardType === 'renewable'
      ? `Renewable (${scholarship.renewableDurationYears || 2} yrs)`
      : scholarship.awardType === 'annual'
      ? 'Annual Award'
      : scholarship.awardType === 'full_tuition'
      ? 'Full Tuition'
      : 'One-time Grant'

  return (
    <Card
      variant="default"
      className="p-5 flex flex-col justify-between space-y-4 hover:border-forest-700/60 hover:shadow-md transition-all group bg-white"
    >
      <div className="space-y-3">
        {/* Top bar: Category + Eligibility status + Bookmark */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-forest-700">
              {scholarship.categoryLabel}
            </span>
            <span className="text-warm-300">•</span>
            <EligibilityBadge assessment={assessment} size="sm" />
            {isTracked && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                <Layers className="w-3 h-3 text-emerald-600" />
                In Pipeline
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onToggleSave(scholarship.id)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
              isSaved
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                : 'bg-white border-warm-300 text-warm-400 hover:text-warm-700 hover:border-warm-400'
            }`}
            aria-label={isSaved ? `Remove ${scholarship.title} from saved` : `Save ${scholarship.title}`}
            title={isSaved ? 'Bookmarked in saved list' : 'Bookmark for later'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600' : ''}`} />
          </button>
        </div>

        {/* Title & Provider */}
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-forest-900 group-hover:text-forest-700 transition-colors line-clamp-2 leading-snug">
            {scholarship.title}
          </h3>
          <p className="text-xs text-warm-600 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-warm-500 shrink-0" />
            <span className="truncate">{scholarship.provider}</span>
            <span className="text-warm-300">•</span>
            <span className="text-warm-500">{scholarship.organizationType}</span>
          </p>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-warm-600 line-clamp-2 leading-relaxed">
          {scholarship.shortDescription}
        </p>

        {/* Region & Criteria pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-warm-600">
          <span className="inline-flex items-center gap-1 bg-warm-50 px-2.5 py-1 rounded-lg border border-warm-200">
            <Globe className="w-3 h-3 text-forest-700" />
            <span>
              {scholarship.eligibleCountries.includes('GLOBAL')
                ? 'Open Globally'
                : scholarship.eligibleCountries.slice(0, 2).join(', ') +
                  (scholarship.eligibleCountries.length > 2
                    ? ` +${scholarship.eligibleCountries.length - 2}`
                    : '')}
            </span>
          </span>

          <span className="inline-flex items-center gap-1 bg-warm-50 px-2.5 py-1 rounded-lg border border-warm-200 capitalize">
            <Layers className="w-3 h-3 text-forest-700" />
            <span>{scholarship.educationLevels.join(', ')}</span>
          </span>
        </div>
      </div>

      {/* Card Footer: Amount + Currency + Deadline + Action */}
      <div className="pt-3 border-t border-warm-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-forest-900">
              {scholarship.formattedAmount.split(' ')[0]}
            </span>
            <span className="text-xs font-semibold text-warm-500 font-mono">
              {scholarship.currency}
            </span>
          </div>
          <p className="text-[11px] text-warm-500">{awardTypeLabel}</p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <div className="text-right sm:pr-1">
            <UrgencyBadge urgency={urgency} daysRemaining={daysRemaining} />
            <p className="text-[10px] text-warm-500 mt-0.5 flex items-center justify-end gap-1">
              <Calendar className="w-3 h-3" />
              <span>Due {formatDisplayDate(scholarship.deadline)}</span>
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelect(scholarship)}
            icon={<ArrowUpRight className="w-3.5 h-3.5" />}
            iconPosition="right"
          >
            Details
          </Button>
        </div>
      </div>
    </Card>
  )
}
