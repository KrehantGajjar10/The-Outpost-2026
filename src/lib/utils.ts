/**
 * Utility functions for formatting, urgency calculation, and class name handling.
 */

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function calculateDaysRemaining(deadlineDateStr: string, fromDateStr = '2026-11-07'): number {
  const deadline = new Date(deadlineDateStr)
  const today = new Date(fromDateStr)
  const diffTime = deadline.getTime() - today.getTime()
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
}

export function getUrgencyLevel(daysRemaining: number): 'urgent' | 'upcoming' | 'normal' {
  if (daysRemaining <= 7) return 'urgent'
  if (daysRemaining <= 21) return 'upcoming'
  return 'normal'
}

export function formatDisplayDate(dateStr: string): string {
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const year = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1
  const day = parseInt(parts[2], 10)
  const date = new Date(Date.UTC(year, month, day))
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}...`
}
