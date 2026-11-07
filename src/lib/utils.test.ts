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

  it('formatCurrency formats integer amounts to USD currency strings without decimals', () => {
    expect(formatCurrency(10000)).toBe('$10,000')
    expect(formatCurrency(0)).toBe('$0')
    expect(formatCurrency(1250000)).toBe('$1,250,000')
  })

  it('calculateDaysRemaining calculates accurate difference between two dates', () => {
    expect(calculateDaysRemaining('2026-11-14', '2026-11-07')).toBe(7)
    expect(calculateDaysRemaining('2026-11-07', '2026-11-07')).toBe(0)
    // Past date should not be negative
    expect(calculateDaysRemaining('2026-11-01', '2026-11-07')).toBe(0)
  })

  it('getUrgencyLevel returns correct urgency tier based on days left', () => {
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
