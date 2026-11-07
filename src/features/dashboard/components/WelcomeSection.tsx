import { ArrowRight, Calendar, Sparkles, Compass, Layers } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { DemoNotice } from '../../../components/shared/DemoNotice'
import { profileService } from '../../profile/services/profileService'
import type { StudentProfile } from '../../profile/types/profile'
import type { DashboardMetrics } from '../types/dashboard'

interface WelcomeSectionProps {
  metrics: DashboardMetrics
  onJumpToDeadlines: () => void
  onFilterInProgress: () => void
  profile?: StudentProfile
}

export function WelcomeSection({
  metrics,
  onJumpToDeadlines,
  onFilterInProgress,
  profile: propProfile,
}: WelcomeSectionProps) {
  const profile = propProfile || profileService.getProfile()

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
              {profile.currentInstitution} • {profile.academicYear || profile.educationLevel}
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, {profile.preferredName || profile.fullName.split(' ')[0]}
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
            <Link to="/applications">
              <Button
                variant="secondary"
                size="sm"
                className="bg-emerald-400 text-forest-950 hover:bg-emerald-300 border-0 font-bold"
                icon={<Layers className="w-3.5 h-3.5" />}
              >
                Applications Workspace ({metrics.inProgressCount})
              </Button>
            </Link>
            <Link to="/scholarships">
              <Button
                variant="secondary"
                size="sm"
                className="bg-emerald-50 text-forest-950 hover:bg-emerald-100 border-0"
                icon={<Compass className="w-3.5 h-3.5 text-emerald-600" />}
              >
                Find Scholarships
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={onJumpToDeadlines}
              className="bg-forest-950/40 text-forest-100 hover:text-white border-forest-700 hover:bg-forest-950"
              icon={<Calendar className="w-3.5 h-3.5 text-emerald-400" />}
            >
              Upcoming Deadlines
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onFilterInProgress}
              className="bg-forest-950/40 text-forest-100 hover:text-white border-forest-700 hover:bg-forest-950"
              icon={<ArrowRight className="w-3.5 h-3.5 text-emerald-400" />}
              iconPosition="right"
            >
              Filter In-Progress
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
