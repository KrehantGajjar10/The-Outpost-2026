import { Clock, Send, Search, Award, XCircle, MinusCircle } from 'lucide-react'
import type { ApplicationStatus } from '../types/application'

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus
  size?: 'sm' | 'md'
  showIcon?: boolean
}

export function ApplicationStatusBadge({
  status,
  size = 'sm',
  showIcon = true,
}: ApplicationStatusBadgeProps) {
  const configs: Record<
    ApplicationStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    planning: {
      label: 'Planning',
      bg: 'bg-warm-100',
      text: 'text-warm-800',
      border: 'border-warm-300',
      icon: <Clock className="w-3 h-3" />,
    },
    in_progress: {
      label: 'In Progress',
      bg: 'bg-amber-light',
      text: 'text-amber-accent',
      border: 'border-amber-200',
      icon: <Clock className="w-3 h-3" />,
    },
    submitted: {
      label: 'Submitted',
      bg: 'bg-emerald-50',
      text: 'text-forest-800',
      border: 'border-emerald-200',
      icon: <Send className="w-3 h-3 text-emerald-600" />,
    },
    under_review: {
      label: 'Under Review',
      bg: 'bg-sky-50',
      text: 'text-sky-800',
      border: 'border-sky-200',
      icon: <Search className="w-3 h-3 text-sky-600" />,
    },
    accepted: {
      label: 'Awarded / Accepted',
      bg: 'bg-emerald-100',
      text: 'text-[#065f46]',
      border: 'border-emerald-300',
      icon: <Award className="w-3 h-3 text-emerald-700" />,
    },
    rejected: {
      label: 'Not Selected',
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      icon: <XCircle className="w-3 h-3 text-rose-600" />,
    },
    withdrawn: {
      label: 'Withdrawn',
      bg: 'bg-warm-100',
      text: 'text-warm-600',
      border: 'border-warm-300',
      icon: <MinusCircle className="w-3 h-3" />,
    },
  }

  const config = configs[status] || configs.planning
  const sizeClasses = size === 'md' ? 'px-3 py-1 text-xs gap-1.5' : 'px-2 py-0.5 text-[11px] gap-1'

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-lg border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      {showIcon && <span className="shrink-0">{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  )
}
