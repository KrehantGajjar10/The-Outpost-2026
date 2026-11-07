import { useState, useMemo, useCallback } from 'react'
import type {
  Scholarship,
  EducationLevel,
  AwardType,
  ScholarshipCategory,
} from '../types/scholarship'
import type { StudentProfile } from '../../profile/types/profile'
import type { EligibilityAssessment, EligibilityStatus } from '../../eligibility/types/eligibility'
import { assessEligibility } from '../../eligibility/services/eligibilityEngine'
import { calculateDaysRemaining, getUrgencyLevel, isCountryMatch } from '../../../lib/utils'

export type SortOption =
  | 'deadline_asc'
  | 'deadline_desc'
  | 'match_desc'
  | 'amount_desc'
  | 'amount_asc'
  | 'title_asc'

export type FundingBand = 'all' | 'under_5k' | '5k_to_10k' | 'over_10k'

export interface FilterState {
  searchQuery: string
  country: string // 'all' or specific country
  educationLevel: 'all' | EducationLevel
  fieldOfStudy: string // 'all' or specific keyword
  category: 'all' | ScholarshipCategory
  currency: string // 'all' or ISO currency code
  awardType: 'all' | AwardType
  urgency: 'all' | 'urgent' | 'upcoming' | 'standard' | 'expired'
  eligibilityStatus: 'all' | EligibilityStatus
  fundingBand: FundingBand
  savedOnly: boolean
}

export const INITIAL_FILTER_STATE: FilterState = {
  searchQuery: '',
  country: 'all',
  educationLevel: 'all',
  fieldOfStudy: 'all',
  category: 'all',
  currency: 'all',
  awardType: 'all',
  urgency: 'all',
  eligibilityStatus: 'all',
  fundingBand: 'all',
  savedOnly: false,
}

export function filterAndSortScholarships(
  scholarships: Scholarship[],
  filters: FilterState,
  sortOption: SortOption,
  savedIds: string[],
  profile: StudentProfile | null,
): {
  items: Scholarship[]
  assessments: Map<string, EligibilityAssessment>
  daysRemainingMap: Map<string, number>
} {
  // Pre-calculate dynamic deadline days & eligibility assessments
  const daysRemainingMap = new Map<string, number>()
  const assessments = new Map<string, EligibilityAssessment>()

  for (const item of scholarships) {
    const days = calculateDaysRemaining(item.deadline)
    daysRemainingMap.set(item.id, days)
    assessments.set(item.id, assessEligibility(item, profile))
  }

  const query = filters.searchQuery.toLowerCase().trim()

  const filtered = scholarships.filter((item) => {
    const days = daysRemainingMap.get(item.id) ?? 0
    const urgency = getUrgencyLevel(days)
    const assessment = assessments.get(item.id)
    const isSaved = savedIds.includes(item.id)

    // Saved only filter
    if (filters.savedOnly && !isSaved) {
      return false
    }

    // Search query filter (title, provider, category, description, tags, fields)
    if (query) {
      const matchTitle = item.title.toLowerCase().includes(query)
      const matchProvider = item.provider.toLowerCase().includes(query)
      const matchCategory = item.categoryLabel.toLowerCase().includes(query)
      const matchDesc =
        item.shortDescription.toLowerCase().includes(query) ||
        item.detailedDescription.toLowerCase().includes(query)
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(query))
      const matchFields = item.fieldsOfStudy.some((f) => f.toLowerCase().includes(query))

      if (!matchTitle && !matchProvider && !matchCategory && !matchDesc && !matchTags && !matchFields) {
        return false
      }
    }

    // Country filter (with alias normalization)
    if (filters.country !== 'all') {
      const isGlobal = item.eligibleCountries.includes('GLOBAL')
      const matchesCountry = item.eligibleCountries.some((c) =>
        isCountryMatch(c, filters.country),
      )
      if (!isGlobal && !matchesCountry) {
        return false
      }
    }

    // Education Level filter
    if (filters.educationLevel !== 'all') {
      if (!item.educationLevels.includes(filters.educationLevel)) {
        return false
      }
    }

    // Field of Study filter
    if (filters.fieldOfStudy !== 'all') {
      const targetField = filters.fieldOfStudy.toLowerCase()
      const isAll = item.fieldsOfStudy.includes('ALL')
      const matchesField = item.fieldsOfStudy.some((f) =>
        f.toLowerCase().includes(targetField),
      )
      if (!isAll && !matchesField) {
        return false
      }
    }

    // Category filter
    if (filters.category !== 'all') {
      if (item.category !== filters.category) {
        return false
      }
    }

    // Currency filter
    if (filters.currency !== 'all') {
      if (item.currency !== filters.currency) {
        return false
      }
    }

    // Award Type filter
    if (filters.awardType !== 'all') {
      if (item.awardType !== filters.awardType) {
        return false
      }
    }

    // Deadline Urgency filter
    if (filters.urgency !== 'all') {
      if (urgency !== filters.urgency) {
        return false
      }
    }

    // Funding Band filter
    if (filters.fundingBand !== 'all') {
      const amt = item.fundingAmount
      if (filters.fundingBand === 'under_5k' && amt >= 5000) return false
      if (filters.fundingBand === '5k_to_10k' && (amt < 5000 || amt > 10000)) return false
      if (filters.fundingBand === 'over_10k' && amt <= 10000) return false
    }

    // Eligibility Status filter
    if (filters.eligibilityStatus !== 'all') {
      if (assessment?.status !== filters.eligibilityStatus) {
        return false
      }
    }

    return true
  })

  // Deterministic sorting
  const sorted = [...filtered].sort((a, b) => {
    const daysA = daysRemainingMap.get(a.id) ?? 0
    const daysB = daysRemainingMap.get(b.id) ?? 0
    const assessmentA = assessments.get(a.id)
    const assessmentB = assessments.get(b.id)

    switch (sortOption) {
      case 'deadline_asc': {
        // Place expired at the end, then sort by nearest deadline
        const isExpiredA = daysA < 0
        const isExpiredB = daysB < 0
        if (isExpiredA && !isExpiredB) return 1
        if (!isExpiredA && isExpiredB) return -1
        return daysA - daysB
      }
      case 'deadline_desc': {
        return daysB - daysA
      }
      case 'match_desc': {
        const rank = (status?: EligibilityStatus) => {
          if (status === 'strong_match') return 3
          if (status === 'potential_match') return 2
          return 1
        }
        const rankA = rank(assessmentA?.status)
        const rankB = rank(assessmentB?.status)
        if (rankA !== rankB) return rankB - rankA
        return (assessmentB?.matchScore ?? 0) - (assessmentA?.matchScore ?? 0)
      }
      case 'amount_desc': {
        // Currency-aware sorting: group by currency first, then sort by amount descending.
        // Never compare raw numbers across different currencies as if they were equivalent.
        const currDiff = a.currency.localeCompare(b.currency)
        if (currDiff !== 0) {
          return currDiff
        }
        return b.fundingAmount - a.fundingAmount
      }
      case 'amount_asc': {
        // Currency-aware sorting: group by currency first, then sort by amount ascending.
        const currDiff = a.currency.localeCompare(b.currency)
        if (currDiff !== 0) {
          return currDiff
        }
        return a.fundingAmount - b.fundingAmount
      }
      case 'title_asc': {
        return a.title.localeCompare(b.title)
      }
      default:
        return 0
    }
  })

  return { items: sorted, assessments, daysRemainingMap }
}

export function useScholarshipFilters(
  scholarships: Scholarship[],
  savedIds: string[],
  profile: StudentProfile | null,
  initialOverrides?: Partial<FilterState>,
) {
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...INITIAL_FILTER_STATE,
    ...(initialOverrides || {}),
  }))
  const [sortOption, setSortOption] = useState<SortOption>('deadline_asc')

  const { items, assessments, daysRemainingMap } = useMemo(
    () => filterAndSortScholarships(scholarships, filters, sortOption, savedIds, profile),
    [scholarships, filters, sortOption, savedIds, profile],
  )

  const setFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTER_STATE)
  }, [])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.searchQuery.trim()) count++
    if (filters.country !== 'all') count++
    if (filters.educationLevel !== 'all') count++
    if (filters.fieldOfStudy !== 'all') count++
    if (filters.category !== 'all') count++
    if (filters.currency !== 'all') count++
    if (filters.awardType !== 'all') count++
    if (filters.urgency !== 'all') count++
    if (filters.eligibilityStatus !== 'all') count++
    if (filters.fundingBand !== 'all') count++
    if (filters.savedOnly) count++
    return count
  }, [filters])

  const setFilterField = setFilter

  const clearFilter = useCallback((key: keyof FilterState) => {
    setFilters((prev) => ({ ...prev, [key]: INITIAL_FILTER_STATE[key] }))
  }, [])

  return {
    filters,
    setFilter,
    setFilterField,
    clearFilter,
    resetFilters,
    sortOption,
    setSortOption,
    filteredScholarships: items,
    assessments,
    daysRemainingMap,
    activeFiltersCount,
    activeFilterCount: activeFiltersCount,
    totalCount: scholarships.length,
    matchedCount: items.length,
  }
}
