import React from 'react'
import { cn } from '../../lib/utils'
import type { UrgencyLevel, ScholarshipStatus } from '../../features/scholarships/types/scholarship'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'forest' | 'urgent' | 'upcoming' | 'normal' | 'demo' | 'success'
  size?: 'sm' | 'md'
  icon?: React.ReactNode
}

export function Badge({
  children,
  className,
  variant = 'neutral',
  size = 'md',
  icon,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full shrink-0 select-none'

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  }

  const variantStyles = {
    neutral: 'bg-[#f4f1ea] text-[#423e38] border border-[#d2cbbf]',
    forest: 'bg-[#ecfdf5] text-[#124332] border border-[#a7f3d0]',
    urgent: 'bg-[#ffe4e6] text-[#be123c] border border-[#fecdd3]',
    upcoming: 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]',
    normal: 'bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]',
    demo: 'bg-[#e0e7ff] text-[#3730a3] border border-[#c7d2fe]',
    success: 'bg-[#ecfdf5] text-[#065f46] border border-[#6ee7b7]',
  }

  return (
    <span
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  )
}

export function UrgencyBadge({
  urgency,
  daysRemaining,
}: {
  urgency: UrgencyLevel
  daysRemaining: number
}) {
  if (urgency === 'urgent') {
    return (
      <Badge variant="urgent" size="sm">
        <span className="w-1.5 h-1.5 rounded-full bg-[#e11d48] animate-pulse" />
        Urgent: {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
      </Badge>
    )
  }
  if (urgency === 'upcoming') {
    return (
      <Badge variant="upcoming" size="sm">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-accent" />
        Upcoming: {daysRemaining} days left
      </Badge>
    )
  }
  return (
    <Badge variant="normal" size="sm">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Standard: {daysRemaining} days left
    </Badge>
  )
}

export function StatusBadge({ status }: { status: ScholarshipStatus }) {
  switch (status) {
    case 'in_progress':
      return (
        <Badge variant="forest" size="sm">
          In Progress
        </Badge>
      )
    case 'saved':
      return (
        <Badge variant="neutral" size="sm">
          Saved
        </Badge>
      )
    case 'submitted':
      return (
        <Badge variant="success" size="sm">
          Submitted
        </Badge>
      )
    case 'awarded':
      return (
        <Badge variant="forest" size="sm">
          Awarded
        </Badge>
      )
    case 'recommended':
    default:
      return (
        <Badge variant="neutral" size="sm">
          Match
        </Badge>
      )
  }
}
