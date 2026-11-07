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

  it('searches accurately by keywords across titles, descriptions, tags, and category labels', () => {
    // Search by category label
    const filterCategoryLabel = { ...INITIAL_FILTER_STATE, searchQuery: 'Healthcare & Biomedical' }
    const resultCategoryLabel = filterAndSortScholarships(
      DEMO_SCHOLARSHIPS,
      filterCategoryLabel,
      'deadline_asc',
      [],
      DEFAULT_STUDENT_PROFILE,
    )
    expect(resultCategoryLabel.items.length).toBe(1)
    expect(resultCategoryLabel.items[0].id).toBe('sch-global-health-2027')

    // Search by provider
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

  it('filters by funding band ranges accurately', () => {
    const filterUnder5k = { ...INITIAL_FILTER_STATE, fundingBand: 'under_5k' as const }
    const resultUnder5k = filterAndSortScholarships(
      DEMO_SCHOLARSHIPS,
      filterUnder5k,
      'deadline_asc',
      [],
      DEFAULT_STUDENT_PROFILE,
    )
    expect(resultUnder5k.items.every((s) => s.fundingAmount < 5000)).toBe(true)

    const filter5kTo10k = { ...INITIAL_FILTER_STATE, fundingBand: '5k_to_10k' as const }
    const result5kTo10k = filterAndSortScholarships(
      DEMO_SCHOLARSHIPS,
      filter5kTo10k,
      'deadline_asc',
      [],
      DEFAULT_STUDENT_PROFILE,
    )
    expect(
      result5kTo10k.items.every((s) => s.fundingAmount >= 5000 && s.fundingAmount <= 10000),
    ).toBe(true)

    const filterOver10k = { ...INITIAL_FILTER_STATE, fundingBand: 'over_10k' as const }
    const resultOver10k = filterAndSortScholarships(
      DEMO_SCHOLARSHIPS,
      filterOver10k,
      'deadline_asc',
      [],
      DEFAULT_STUDENT_PROFILE,
    )
    expect(resultOver10k.items.every((s) => s.fundingAmount > 10000)).toBe(true)
  })

  it('filters by country using normalized aliases (e.g. US matches United States)', () => {
    const filterUS = { ...INITIAL_FILTER_STATE, country: 'USA' }
    const resultUS = filterAndSortScholarships(
      DEMO_SCHOLARSHIPS,
      filterUS,
      'deadline_asc',
      [],
      DEFAULT_STUDENT_PROFILE,
    )
    expect(resultUS.items.length).toBeGreaterThan(0)
    expect(
      resultUS.items.every(
        (s) => s.eligibleCountries.includes('GLOBAL') || s.eligibleCountries.includes('United States'),
      ),
    ).toBe(true)
  })

  it('sorts currency-awarely without treating raw integers from different currencies as equivalent', () => {
    // When sorting amount_desc, items are grouped by currency first, then sorted by amount descending
    const result = filterAndSortScholarships(
      DEMO_SCHOLARSHIPS,
      INITIAL_FILTER_STATE,
      'amount_desc',
      [],
      DEFAULT_STUDENT_PROFILE,
    )

    // Items within the same currency must be sorted descending by fundingAmount
    for (let i = 0; i < result.items.length - 1; i++) {
      const a = result.items[i]
      const b = result.items[i + 1]
      if (a.currency === b.currency) {
        expect(a.fundingAmount).toBeGreaterThanOrEqual(b.fundingAmount)
      } else {
        // Currencies are grouped alphabetically
        expect(a.currency.localeCompare(b.currency)).toBeLessThanOrEqual(0)
      }
    }
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
})
