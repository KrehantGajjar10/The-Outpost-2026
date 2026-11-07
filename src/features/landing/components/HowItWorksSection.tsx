import { Search, BookOpen, BookmarkCheck, CalendarClock } from 'lucide-react'
import { Card } from '../../../components/ui/Card'

export function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Discover Targeted Opportunities',
      description:
        'Filter scholarships by your academic major, eligibility criteria, nationality, and award types without wading through sponsored advertisements.',
      icon: <Search className="w-6 h-6 text-emerald-500" />,
      badge: 'Discovery Phase',
    },
    {
      step: '02',
      title: 'Understand Requirements Clearly',
      description:
        'Review clean requirement breakdowns: essay prompts, minimum GPA floors, letters of recommendation, and multi-year renewal rules without confusing fine print.',
      icon: <BookOpen className="w-6 h-6 text-emerald-500" />,
      badge: 'Analysis Phase',
    },
    {
      step: '03',
      title: 'Organize Your Application Assets',
      description:
        'Save matching awards to your personal pipeline. Keep checklist tracking for transcripts, statements of purpose, and faculty recommendation progress in one place.',
      icon: <BookmarkCheck className="w-6 h-6 text-emerald-500" />,
      badge: 'Preparation Phase',
    },
    {
      step: '04',
      title: 'Track Deadlines & Status Stages',
      description:
        'Visual urgency countdowns ensure you submit before deadlines. Never lose track of whether a submission is in draft, review, or awaiting institutional confirmation.',
      icon: <CalendarClock className="w-6 h-6 text-emerald-500" />,
      badge: 'Execution Phase',
    },
  ]

  return (
    <section id="how-it-works" className="py-20 bg-white border-y border-warm-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            The Student Journey
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-forest-900">
            Four steps from scholarship discovery to submission.
          </h2>
          <p className="text-base text-warm-600 leading-relaxed">
            GRANTLY simplifies higher education funding by organizing the full application lifecycle into four clear, sequential stages.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
          {steps.map((item) => (
            <Card
              key={item.step}
              variant="default"
              className="p-6 relative flex flex-col justify-between hover:border-forest-700/50 hover:shadow-md transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-forest-900 text-emerald-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-2xl font-bold font-mono text-warm-500 group-hover:text-forest-700 transition-colors">
                    {item.step}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-forest-700">
                    {item.badge}
                  </span>
                  <h3 className="text-lg font-bold text-forest-900 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-warm-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-warm-100">
                <div className="h-1 w-full bg-warm-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-2/3 group-hover:w-full transition-all duration-300" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
