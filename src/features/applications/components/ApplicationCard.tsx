import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { UrgencyBadge } from '../../../components/ui/Badge'
import { ApplicationStatusBadge } from './ApplicationStatusBadge'
import { DEMO_SCHOLARSHIPS } from '../../scholarships/data/mockScholarships'
import { applicationService } from '../services/applicationService'
import {
  formatDisplayDate,
  calculateDaysRemaining,
  getUrgencyLevel,
} from '../../../lib/utils'
import {
  Calendar,
  FileText,
  ArrowRight,
  Send,
  AlertTriangle,
} from 'lucide-react'
import type { TrackedApplication } from '../types/application'

interface ApplicationCardProps {
  application: TrackedApplication
  onOpenWorkspace: (app: TrackedApplication) => void
  onQuickAdvanceStatus?: (app: TrackedApplication) => void
}

export function ApplicationCard({
  application,
  onOpenWorkspace,
  onQuickAdvanceStatus,
}: ApplicationCardProps) {
  const scholarship = DEMO_SCHOLARSHIPS.find((s) => s.id === application.scholarshipId)
  const effectiveDeadline =
    application.targetSubmissionDate || scholarship?.deadline || '2026-12-31'
  const daysRemaining = calculateDaysRemaining(effectiveDeadline)
  const urgency = getUrgencyLevel(daysRemaining)
  const isOverdue = daysRemaining < 0
  const readiness = applicationService.calculateReadiness(application.documents)

  const getQuickActionLabel = () => {
    switch (application.status) {
      case 'planning':
        return 'Start Application'
      case 'in_progress':
        return 'Record Submission'
      case 'submitted':
        return 'Update to Review'
      case 'under_review':
        return 'Record Outcome'
      default:
        return null
    }
  }

  const quickAction = getQuickActionLabel()

  return (
    <Card
      variant="default"
      className={`p-5 flex flex-col justify-between space-y-4 hover:border-forest-700/50 transition-all ${
        isOverdue && application.status !== 'submitted' && application.status !== 'accepted'
          ? 'border-rose-300 bg-rose-50/20'
          : 'bg-white'
      }`}
    >
      <div className="space-y-3">
        {/* Top Badges & Status */}
        <div className="flex items-center justify-between gap-2">
          <ApplicationStatusBadge status={application.status} size="sm" />
          <UrgencyBadge urgency={urgency} daysRemaining={daysRemaining} />
        </div>

        {/* Title and Provider */}
        <div className="space-y-1">
          <h3
            className="text-base font-bold text-forest-900 line-clamp-1 hover:text-emerald-700 cursor-pointer"
            onClick={() => onOpenWorkspace(application)}
          >
            {scholarship?.title || 'Scholarship Application'}
          </h3>
          <p className="text-xs text-warm-600 line-clamp-1">
            {scholarship?.provider || 'Scholarship Provider'} • {scholarship?.organizationType || 'Foundation'}
          </p>
        </div>

        {/* Funding Amount & Deadline info */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-warm-100">
          <span className="text-base font-extrabold text-forest-900 tracking-tight">
            {(scholarship?.formattedAmount || '$10,000').split(' ')[0]}
          </span>
          <div className="flex items-center gap-1.5 text-warm-600">
            <Calendar className="w-3.5 h-3.5 text-forest-700" />
            <span>Due {formatDisplayDate(effectiveDeadline)}</span>
          </div>
        </div>

        {/* Document Readiness Progress */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-warm-700 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-forest-700" />
              <span>Document Checklist</span>
            </span>
            <span className="font-mono text-forest-800 font-bold">
              {readiness.ready}/{readiness.total} ({readiness.percentage}%)
            </span>
          </div>

          <div className="w-full bg-warm-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                readiness.percentage === 100
                  ? 'bg-emerald-600'
                  : readiness.percentage >= 50
                  ? 'bg-forest-800'
                  : 'bg-amber-accent'
              }`}
              style={{ width: `${readiness.percentage}%` }}
            />
          </div>
        </div>

        {/* Personal Notes preview */}
        {application.notes && (
          <p className="text-xs text-warm-600 line-clamp-2 italic bg-warm-50 p-2.5 rounded-lg border border-warm-200">
            "{application.notes}"
          </p>
        )}

        {/* Overdue alert indicator */}
        {isOverdue && application.status !== 'submitted' && application.status !== 'accepted' && (
          <div className="flex items-center gap-1.5 text-xs text-[#be123c] font-semibold bg-rose-50 p-2 rounded-lg border border-rose-200">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Deadline passed {Math.abs(daysRemaining)} days ago</span>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="pt-3 border-t border-warm-200 flex items-center justify-between gap-2">
        {quickAction && onQuickAdvanceStatus ? (
          <button
            type="button"
            onClick={() => onQuickAdvanceStatus(application)}
            className="text-xs text-forest-800 hover:text-forest-950 font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <Send className="w-3 h-3 text-emerald-600" />
            <span>{quickAction}</span>
          </button>
        ) : (
          <span className="text-[11px] text-warm-500">
            Updated {formatDisplayDate(application.updatedAt.slice(0, 10))}
          </span>
        )}

        <Button
          variant="primary"
          size="sm"
          onClick={() => onOpenWorkspace(application)}
          icon={<ArrowRight className="w-3.5 h-3.5" />}
          iconPosition="right"
        >
          Open Workspace
        </Button>
      </div>
    </Card>
  )
}
