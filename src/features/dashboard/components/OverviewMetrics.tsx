import { Bookmark, Clock, DollarSign, Send } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import type { DashboardMetrics } from '../types/dashboard'

interface OverviewMetricsProps {
  metrics: DashboardMetrics
  onSelectMetric?: (metricType: 'saved' | 'in_progress' | 'deadlines') => void
}

export function OverviewMetrics({ metrics, onSelectMetric }: OverviewMetricsProps) {
  const cards = [
    {
      id: 'saved' as const,
      title: 'Saved Opportunities',
      value: metrics.totalSaved.toString(),
      subtitle: 'In active review & saved pipeline',
      icon: <Bookmark className="w-5 h-5 text-forest-700" />,
      badge: `${metrics.totalSaved} opportunities`,
      bgColor: 'bg-[#ecfdf5]',
    },
    {
      id: 'in_progress' as const,
      title: 'Applications In Progress',
      value: metrics.inProgressCount.toString(),
      subtitle: 'Drafts, essays & letters pending',
      icon: <Send className="w-5 h-5 text-emerald-600" />,
      badge: 'Active submissions',
      bgColor: 'bg-[#edfbf4]',
    },
    {
      id: 'deadlines' as const,
      title: 'Next Deadline',
      value: `${metrics.nearestDeadlineDays} Days`,
      subtitle: `Due: ${metrics.nearestScholarshipTitle}`,
      icon: <Clock className="w-5 h-5 text-amber-accent" />,
      badge: 'Priority action required',
      bgColor: 'bg-[#fffbeb]',
      isAlert: metrics.nearestDeadlineDays <= 7,
    },
    {
      id: 'funding' as const,
      title: 'Potential Funding',
      value: metrics.formattedPotentialFunding,
      subtitle: 'Calculated across saved & tracked awards',
      icon: <DollarSign className="w-5 h-5 text-[#166534]" />,
      badge: 'Total pipeline value',
      bgColor: 'bg-[#f0fdf4]',
    },
  ]

  return (
    <section aria-label="Pipeline Overview Metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card
          key={card.id}
          variant="default"
          className="p-5 flex flex-col justify-between space-y-3 hover:border-forest-700/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-warm-600 tracking-tight">
              {card.title}
            </span>
            <div className={`w-9 h-9 rounded-xl ${card.bgColor} flex items-center justify-center border border-warm-300/40`}>
              {card.icon}
            </div>
          </div>

          <div className="space-y-0.5">
            <p
              className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                card.isAlert ? 'text-[#be123c]' : 'text-forest-900'
              }`}
            >
              {card.value}
            </p>
            <p className="text-xs text-warm-500 truncate" title={card.subtitle}>
              {card.subtitle}
            </p>
          </div>

          <div className="pt-2 border-t border-warm-100 flex items-center justify-between text-[11px] text-warm-600">
            <span className="font-medium text-forest-700">{card.badge}</span>
            {card.id !== 'funding' && onSelectMetric && (
              <button
                type="button"
                onClick={() => onSelectMetric(card.id)}
                className="hover:text-forest-900 underline cursor-pointer"
              >
                Filter list
              </button>
            )}
          </div>
        </Card>
      ))}
    </section>
  )
}
