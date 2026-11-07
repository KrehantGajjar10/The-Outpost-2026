/**
 * Core utility functions for formatting, dynamic deadline calculations,
 * currency handling, and class name management.
 */

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Formats monetary amounts with ISO 4217 currency support.
 * Defaults to USD, but handles EUR, GBP, CAD, AUD, INR, etc.
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${currency.toUpperCase()} ${amount.toLocaleString('en-US')}`
  }
}

/**
 * Calculates calendar days remaining between a deadline and today (or reference date).
 * Compares date-only values (UTC midnight) to avoid timezone-related off-by-one shifts.
 * Returns negative numbers for expired dates.
 */
export function calculateDaysRemaining(deadlineDateStr: string, fromDate?: Date | string): number {
  if (!deadlineDateStr) return 0

  const deadlineParts = deadlineDateStr.split('-').map(Number)
  if (deadlineParts.length !== 3 || deadlineParts.some(isNaN)) return 0

  const deadlineUtc = Date.UTC(deadlineParts[0], deadlineParts[1] - 1, deadlineParts[2])

  let todayUtc: number
  if (fromDate) {
    if (typeof fromDate === 'string') {
      const fromParts = fromDate.split('-').map(Number)
      todayUtc = Date.UTC(fromParts[0], fromParts[1] - 1, fromParts[2])
    } else {
      todayUtc = Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate())
    }
  } else {
    const now = new Date()
    todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  }

  const diffMs = deadlineUtc - todayUtc
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

export type UrgencyLevel = 'urgent' | 'upcoming' | 'normal' | 'expired'

/**
 * Derives urgency tier from actual days remaining.
 * Accurately recognizes expired deadlines instead of conflating with urgent.
 */
export function getUrgencyLevel(daysRemaining: number): UrgencyLevel {
  if (daysRemaining < 0) return 'expired'
  if (daysRemaining <= 7) return 'urgent'
  if (daysRemaining <= 21) return 'upcoming'
  return 'normal'
}

/**
 * Formats ISO date string (YYYY-MM-DD) to readable display date (e.g. "Nov 14, 2026").
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const year = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1
  const day = parseInt(parts[2], 10)
  if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr

  const date = new Date(Date.UTC(year, month, day))
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}...`
}

/**
 * Normalizes country names and common aliases to canonical country names.
 */
export function normalizeCountry(country: string): string {
  if (!country) return ''
  const trimmed = country.trim().toLowerCase()
  const map: Record<string, string> = {
    us: 'United States',
    usa: 'United States',
    'united states of america': 'United States',
    'u.s.': 'United States',
    'u.s.a.': 'United States',
    uk: 'United Kingdom',
    'u.k.': 'United Kingdom',
    'great britain': 'United Kingdom',
    britain: 'United Kingdom',
    england: 'United Kingdom',
    ca: 'Canada',
    can: 'Canada',
    de: 'Germany',
    deutschland: 'Germany',
    in: 'India',
    ind: 'India',
    sg: 'Singapore',
    sgp: 'Singapore',
    se: 'Sweden',
    sverige: 'Sweden',
    au: 'Australia',
    aus: 'Australia',
    fr: 'France',
    fra: 'France',
  }
  return map[trimmed] || country.trim()
}

/**
 * Checks whether two country designations match (accounting for aliases & GLOBAL).
 */
export function isCountryMatch(c1?: string, c2?: string): boolean {
  if (!c1 || !c2) return false
  if (c1.toUpperCase() === 'GLOBAL' || c2.toUpperCase() === 'GLOBAL') return true
  const n1 = normalizeCountry(c1).toLowerCase()
  const n2 = normalizeCountry(c2).toLowerCase()
  return n1 === n2 || n1.includes(n2) || n2.includes(n1)
}

/**
 * Checks whether nationality matches requirements (accounting for ANY).
 */
export function isNationalityMatch(studentNat?: string, requiredNat?: string): boolean {
  if (!studentNat || !requiredNat) return false
  if (requiredNat.toUpperCase() === 'ANY') return true
  const n1 = studentNat.trim().toLowerCase()
  const n2 = requiredNat.trim().toLowerCase()
  return n1 === n2 || n1.includes(n2) || n2.includes(n1)
}
