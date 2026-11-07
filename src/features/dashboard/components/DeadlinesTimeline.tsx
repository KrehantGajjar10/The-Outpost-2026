import { Link } from 'react-router-dom'
import { Clock, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { formatDisplayDate } from '../../../lib/utils'
import type { Scholarship } from '../../scholarships/types/scholarship'

interface DeadlinesTimelineProps {
  scholarships: Scholarship[]
  onSelectScholarship: (scholarship: Scholarship) => void
}

export function DeadlinesTimeline({ scholarships, onSelectScholarship }: DeadlinesTimelineProps) {
  // Sort active bookmarked or in_progress scholarships by deadline asc (excluding expired)
  const trackedDeadlines = scholarships
    .filter((s) => (s.isSaved || s.status === 'in_progress') && (s.daysRemaining ?? 0) >= 0)
    .sort((a, b) => (a.daysRemaining ?? 0) - (b.daysRemaining ?? 0))

  return (
    <section id="deadlines" aria-label="Upcoming Deadlines Schedule" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold tracking-tight text-forest-900">
              Upcoming Application Deadlines
            </h3>
            <span className="text-xs font-semibold text-forest-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {trackedDeadlines.length} tracked
            </span>
          </div>
          <p className="text-xs text-warm-600">
            Chronological milestone schedule derived from your active pipeline.
          </p>
        </div>

        <Link
          to="/applications"
          className="text-xs font-bold text-forest-800 hover:text-forest-950 flex items-center gap-1 hover:underline shrink-0"
        >
          <span>Manage Workspace &amp; Checklists</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {trackedDeadlines.map((item) => {
          const completedReqs = (item.requirements ?? []).filter((r) => r.completed).length
          const totalReqs = item.requirements?.length ?? item.requiredDocuments?.length ?? 0
          const isUrgent = item.urgency === 'urgent'

          return (
            <Card
              key={item.id}
              variant="default"
              className={`p-4 transition-all ${
                isUrgent ? 'border-[#fecdd3] bg-[#fff5f5]/50' : 'bg-white'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left side: deadline badge & title */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                      isUrgent
                        ? 'bg-[#ffe4e6] text-[#be123c] border-[#fecdd3]'
                        : 'bg-warm-50 text-forest-900 border-warm-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {formatDisplayDate(item.deadline).split(' ')[0]}
                    </span>
                    <span className="text-base font-extrabold leading-none">
                      {formatDisplayDate(item.deadline).split(' ')[1].replace(',', '')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-forest-700">
                        {item.categoryLabel}
                      </span>
                      <span className="text-warm-300">•</span>
                      <span className="text-xs font-medium text-warm-500">
                        {(item.formattedAmount || item.amountFormatted || '').split(' ')[0]}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-forest-900 line-clamp-1">
                      {item.title}
                    </h4>

                    {item.currentStage && (
                      <p className="text-xs text-warm-600 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-forest-700" />
                        <span>Current stage: {item.currentStage}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right side: checklist status & action */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-warm-200">
                  {/* Urgency indicator (color + text + icon) */}
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      {isUrgent ? (
                        <AlertTriangle className="w-4 h-4 text-[#e11d48]" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-accent" />
                      )}
                      <span
                        className={`text-xs font-bold ${
                          isUrgent ? 'text-[#be123c]' : 'text-[#92400e]'
                        }`}
                      >
                        {item.daysRemaining} {item.daysRemaining === 1 ? 'day' : 'days'} left
                      </span>
                    </div>
                    <p className="text-[11px] text-warm-500 flex items-center gap-1 justify-end">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{completedReqs}/{totalReqs} requirements ready</span>
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectScholarship(item)}
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                    iconPosition="right"
                  >
                    Review
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
