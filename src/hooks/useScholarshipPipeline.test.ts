import { describe, it, expect } from 'vitest'
import { INITIAL_DEMO_SCHOLARSHIPS } from '../features/dashboard/data/mockScholarships'

describe('Scholarship pipeline data verification', () => {
  it('contains valid mock scholarships with non-negative amounts and daysRemaining', () => {
    expect(INITIAL_DEMO_SCHOLARSHIPS.length).toBeGreaterThan(0)
    for (const sch of INITIAL_DEMO_SCHOLARSHIPS) {
      expect(sch.id).toBeTruthy()
      expect(sch.title).toBeTruthy()
      expect(sch.amount).toBeGreaterThan(0)
      expect(sch.daysRemaining).toBeGreaterThanOrEqual(0)
      expect(sch.isSampleData).toBe(true)
      expect(Array.isArray(sch.requirements)).toBe(true)
    }
  })

  it('correctly calculates initial totals without contradictory math', () => {
    const savedOrTracked = INITIAL_DEMO_SCHOLARSHIPS.filter(
      (s) => s.status === 'saved' || s.status === 'in_progress' || s.status === 'submitted',
    )
    const expectedSum = savedOrTracked.reduce((acc, curr) => acc + curr.amount, 0)
    expect(expectedSum).toBeGreaterThan(0)

    const inProgress = INITIAL_DEMO_SCHOLARSHIPS.filter((s) => s.status === 'in_progress')
    expect(inProgress.length).toBe(3)
  })
})
