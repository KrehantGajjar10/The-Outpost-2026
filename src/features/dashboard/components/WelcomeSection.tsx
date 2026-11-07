import { ArrowRight, Calendar, Sparkles } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { DemoNotice } from '../../../components/shared/DemoNotice'
import { DEMO_STUDENT_PROFILE } from '../data/mockStudentProfile'
import type { DashboardMetrics } from '../types/dashboard'

interface WelcomeSectionProps {
  metrics: DashboardMetrics
  onJumpToDeadlines: () => void
  onFilterInProgress: () => void
}

export function WelcomeSection({
  metrics,
  onJumpToDeadlines,
  onFilterInProgress,
}: WelcomeSectionProps) {
  return (
    <section className="space-y-4">
      {/* Demo notice banner */}
      <DemoNotice />

      {/* Main welcome banner */}
      <div className="rounded-2xl bg-linear-to-r from-forest-900 to-forest-800 text-white p-6 sm:p-8 border border-forest-700 shadow-sm relative overflow-hidden">
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-950/80 text-emerald-400 text-xs font-semibold border border-forest-700">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {DEMO_STUDENT_PROFILE.institution} • {DEMO_STUDENT_PROFILE.academicStanding}
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, {DEMO_STUDENT_PROFILE.preferredName}
            </h1>
            <p className="text-sm sm:text-base text-forest-200 leading-relaxed">
              You are tracking <strong className="text-white font-semibold">{metrics.inProgressCount} active applications</strong> with{' '}
              <strong className="text-white font-semibold">{metrics.formattedPotentialFunding}</strong> in potential funding. Your next submission milestone is due in{' '}
              <span className="font-semibold text-[#fde68a] underline decoration-amber-accent">
                {metrics.nearestDeadlineDays} days
              </span>.
            </p>
          </div>

          {/* Quick action triggers */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={onJumpToDeadlines}
              className="bg-emerald-50 text-forest-950 hover:bg-emerald-100 border-0"
              icon={<Calendar className="w-3.5 h-3.5 text-emerald-600" />}
            >
              View Upcoming Deadlines
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onFilterInProgress}
              className="bg-forest-950/40 text-forest-950 border-forest-700 hover:bg-forest-950 hover:text-white"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
            >
              Filter In-Progress ({metrics.inProgressCount})
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
