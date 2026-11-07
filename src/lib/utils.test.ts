import { describe, it, expect } from 'vitest'
import {
  cn,
  formatCurrency,
  calculateDaysRemaining,
  getUrgencyLevel,
  formatDisplayDate,
  truncateText,
} from './utils'

describe('utils', () => {
  it('cn joins class names correctly and filters falsy values', () => {
    const isHidden = false
    expect(cn('btn', isHidden && 'hidden', 'btn-primary', null, undefined, 'active')).toBe(
      'btn btn-primary active',
    )
  })

  it('formatCurrency formats amounts across different currencies', () => {
    expect(formatCurrency(10000, 'USD')).toBe('$10,000')
    expect(formatCurrency(5000, 'EUR')).toBe('€5,000')
    expect(formatCurrency(12000, 'GBP')).toBe('£12,000')
    expect(formatCurrency(8500, 'CAD')).toBe('CA$8,500')
  })

  it('calculateDaysRemaining calculates accurate difference between two dates without off-by-one errors', () => {
    expect(calculateDaysRemaining('2026-11-14', '2026-11-07')).toBe(7)
    expect(calculateDaysRemaining('2026-11-07', '2026-11-07')).toBe(0)
    // Expired deadline returns negative days
    expect(calculateDaysRemaining('2026-11-01', '2026-11-07')).toBe(-6)
    expect(calculateDaysRemaining('2026-10-31', '2026-11-07')).toBe(-7)
  })

  it('getUrgencyLevel returns expired for past dates and correct tiers for upcoming', () => {
    expect(getUrgencyLevel(-5)).toBe('expired')
    expect(getUrgencyLevel(0)).toBe('urgent')
    expect(getUrgencyLevel(3)).toBe('urgent')
    expect(getUrgencyLevel(7)).toBe('urgent')
    expect(getUrgencyLevel(8)).toBe('upcoming')
    expect(getUrgencyLevel(21)).toBe('upcoming')
    expect(getUrgencyLevel(22)).toBe('normal')
    expect(getUrgencyLevel(60)).toBe('normal')
  })

  it('formatDisplayDate formats ISO date string to readable US date format', () => {
    expect(formatDisplayDate('2026-11-14')).toBe('Nov 14, 2026')
    expect(formatDisplayDate('2027-01-05')).toBe('Jan 5, 2027')
  })

  it('truncateText truncates text over maxLength and adds ellipsis', () => {
    expect(truncateText('Hello world', 5)).toBe('Hello...')
    expect(truncateText('Short', 10)).toBe('Short')
  })
})
