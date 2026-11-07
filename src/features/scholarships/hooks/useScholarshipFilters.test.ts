import { describe, it, expect } from 'vitest'
import {
  filterAndSortScholarships,
  INITIAL_FILTER_STATE,
} from './useScholarshipFilters'
import { DEMO_SCHOLARSHIPS } from '../data/mockScholarships'
import { DEFAULT_STUDENT_PROFILE } from '../../profile/data/defaultProfile'

describe('useScholarshipFilters / filterAndSortScholarships', () => {
  it('returns all scholarships when initial filter state is applied', () => {
    const result = filterAndSortScholarships(
      DEMO_SCHOLARSHIPS,
      INITIAL_FILTER_STATE,
      'deadline_asc',
      [],
      DEFAULT_STUDENT_PROFILE,
    )
    expect(result.items.length).toBe(DEMO_SCHOLARSHIPS.length)
  })

  it('searches accurately by keywords across titles, descriptions, and tags', () => {
    const filter = { ...INITIAL_FILTER_STATE, searchQuery: 'CleanContinent' }
    const result = filterAndSortScholarships(
      DEMO_SCHOLARSHIPS,
      filter,
      'deadline_asc',
      [],
      DEFAULT_STUDENT_PROFILE,
    )
    expect(result.items.length).toBe(1)
    expect(result.items[0].id).toBe('sch-euro-greentech-2027')
  })

  it('filters by currency code without conflating international denominations', () => {
    const filterEur = { ...INITIAL_FILTER_STATE, currency: 'EUR' }
    const resultEur = filterAndSortScholarships(
      DEMO_SCHOLARSHIPS,
      filterEur,
      'deadline_asc',
      [],
      DEFAULT_STUDENT_PROFILE,
    )
    expect(resultEur.items.every((s) => s.currency === 'EUR')).toBe(true)
    expect(resultEur.items.length).toBeGreaterThan(0)

    const filterCad = { ...INITIAL_FILTER_STATE, currency: 'CAD' }
    const resultCad = filterAndSortScholarships(
      DEMO_SCHOLARSHIPS,
      filterCad,
      'deadline_asc',
      [],
      DEFAULT_STUDENT_PROFILE,
    )
    expect(resultCad.items.every((s) => s.currency === 'CAD')).toBe(true)
  })

  it('combines multiple filters simultaneously (education level + category + country)', () => {
    const combinedFilter = {
      ...INITIAL_FILTER_STATE,
      educationLevel: 'undergraduate' as const,
      category: 'stem' as const,
      currency: 'USD',
    }
    const result = filterAndSortScholarships(
      DEMO_SCHOLARSHIPS,
      combinedFilter,
      'deadline_asc',
      [],
      DEFAULT_STUDENT_PROFILE,
    )
    expect(result.items.every((s) => s.educationLevels.includes('undergraduate'))).toBe(true)
    expect(result.items.every((s) => s.category === 'stem')).toBe(true)
    expect(result.items.every((s) => s.currency === 'USD')).toBe(true)
  })

  it('filters by saved status correctly', () => {
    const savedIds = ['sch-horizon-stem-2026', 'sch-beacon-firstgen-2026']
    const savedFilter = { ...INITIAL_FILTER_STATE, savedOnly: true }
    const result = filterAndSortScholarships(
      DEMO_SCHOLARSHIPS,
      savedFilter,
      'deadline_asc',
      savedIds,
      DEFAULT_STUDENT_PROFILE,
    )
    expect(result.items.length).toBe(2)
    expect(result.items.every((s) => savedIds.includes(s.id))).toBe(true)
  })

  it('sorts deterministically by alphabetical title', () => {
    const result = filterAndSortScholarships(
      DEMO_SCHOLARSHIPS,
      INITIAL_FILTER_STATE,
      'title_asc',
      [],
      DEFAULT_STUDENT_PROFILE,
    )
    for (let i = 0; i < result.items.length - 1; i++) {
      expect(result.items[i].title.localeCompare(result.items[i + 1].title)).toBeLessThanOrEqual(0)
    }
  })

  it('sorts by match score with strong matches first', () => {
    const result = filterAndSortScholarships(
      DEMO_SCHOLARSHIPS,
      INITIAL_FILTER_STATE,
      'match_desc',
      [],
      DEFAULT_STUDENT_PROFILE,
    )
    const firstAssessment = result.assessments.get(result.items[0].id)
    expect(firstAssessment?.status).toBe('strong_match')
  })
})
