import { describe, it, expect } from 'vitest'
import { INITIAL_DEMO_SCHOLARSHIPS } from '../features/dashboard/data/mockScholarships'
import { formatCurrency } from '../lib/utils'

describe('Scholarship pipeline data and metrics verification', () => {
  it('contains valid mock scholarships with non-negative amounts and daysRemaining', () => {
    expect(INITIAL_DEMO_SCHOLARSHIPS.length).toBeGreaterThan(0)
    for (const sch of INITIAL_DEMO_SCHOLARSHIPS) {
      expect(sch.id).toBeTruthy()
      expect(sch.title).toBeTruthy()
      expect(sch.amount || sch.fundingAmount || 0).toBeGreaterThan(0)
      expect(sch.daysRemaining ?? 0).toBeGreaterThanOrEqual(0)
      expect(sch.isSampleData).toBe(true)
      expect(Array.isArray(sch.requirements ?? sch.requiredDocuments)).toBe(true)
    }
  })

  it('keeps inProgress and submitted counts distinct without conflation', () => {
    const inProgress = INITIAL_DEMO_SCHOLARSHIPS.filter((s) => s.status === 'in_progress')
    const submitted = INITIAL_DEMO_SCHOLARSHIPS.filter((s) => s.status === 'submitted')

    // In Chapter 02.1: submitted applications must NEVER be counted as in_progress
    expect(inProgress.length).toBe(3)
    expect(submitted.length).toBe(1)
    expect(inProgress.some((s) => s.status === 'submitted')).toBe(false)
  })

  it('calculates total potential funding summing strictly USD items to avoid fake exchange rates', () => {
    const usdTracked = INITIAL_DEMO_SCHOLARSHIPS.filter(
      (s) => (s.status === 'in_progress' || s.status === 'submitted') && s.currency === 'USD',
    )
    const expectedUsdSum = usdTracked.reduce((acc, curr) => acc + (curr.fundingAmount || curr.amount || 0), 0)
    expect(expectedUsdSum).toBe(22500) // sch-horizon-stem-2026 ($10k) + sch-apex-tech-2026 ($12.5k)
    expect(formatCurrency(expectedUsdSum, 'USD')).toBe('$22,500')

    // Verify non-USD items exist in the catalog (multicurrency international support)
    const nonUsdItems = INITIAL_DEMO_SCHOLARSHIPS.filter((s) => s.currency !== 'USD')
    expect(nonUsdItems.length).toBeGreaterThan(0)
    const currencies = new Set(INITIAL_DEMO_SCHOLARSHIPS.map((s) => s.currency))
    expect(currencies.has('EUR')).toBe(true)
    expect(currencies.has('GBP')).toBe(true)
    expect(currencies.has('CAD')).toBe(true)
    expect(currencies.has('SGD')).toBe(true)
    expect(currencies.has('INR')).toBe(true)
  })

  it('provides stable IDs and shared catalog identity across discovery and dashboard', () => {
    const ids = INITIAL_DEMO_SCHOLARSHIPS.map((s) => s.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
    expect(ids).toContain('sch-horizon-stem-2026')
    expect(ids).toContain('sch-civic-impact-2026')
    expect(ids).toContain('sch-apex-tech-2026')
    expect(ids.length).toBe(12)
  })
})

