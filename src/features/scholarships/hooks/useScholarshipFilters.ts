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
import { calculateDaysRemaining, getUrgencyLevel } from '../../../lib/utils'

export type SortOption =
  | 'deadline_asc'
  | 'deadline_desc'
  | 'match_desc'
  | 'amount_desc'
  | 'title_asc'

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

    // Search query filter (title, provider, description, tags, fields)
    if (query) {
      const matchTitle = item.title.toLowerCase().includes(query)
      const matchProvider = item.provider.toLowerCase().includes(query)
      const matchDesc =
        item.shortDescription.toLowerCase().includes(query) ||
        item.detailedDescription.toLowerCase().includes(query)
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(query))
      const matchFields = item.fieldsOfStudy.some((f) => f.toLowerCase().includes(query))

      if (!matchTitle && !matchProvider && !matchDesc && !matchTags && !matchFields) {
        return false
      }
    }

    // Country filter
    if (filters.country !== 'all') {
      const isGlobal = item.eligibleCountries.includes('GLOBAL')
      const matchesCountry = item.eligibleCountries.some(
        (c) => c.toLowerCase() === filters.country.toLowerCase(),
      )
      if (!isGlobal && !matchesCountry) return false
    }

    // Education level filter
    if (filters.educationLevel !== 'all') {
      if (!item.educationLevels.includes(filters.educationLevel)) {
        return false
      }
    }

    // Field of study filter
    if (filters.fieldOfStudy !== 'all') {
      const isAll = item.fieldsOfStudy.includes('ALL')
      const target = filters.fieldOfStudy.toLowerCase()
      const matchesField = item.fieldsOfStudy.some((f) =>
        f.toLowerCase().includes(target),
      )
      if (!isAll && !matchesField) return false
    }

    // Category filter
    if (filters.category !== 'all' && item.category !== filters.category) {
      return false
    }

    // Currency filter
    if (filters.currency !== 'all' && item.currency !== filters.currency) {
      return false
    }

    // Award type filter
    if (filters.awardType !== 'all' && item.awardType !== filters.awardType) {
      return false
    }

    // Deadline urgency filter
    if (filters.urgency !== 'all') {
      if (filters.urgency === 'expired') {
        if (days >= 0) return false
      } else if (filters.urgency === 'urgent') {
        if (urgency !== 'urgent') return false
      } else if (filters.urgency === 'upcoming') {
        if (urgency !== 'upcoming') return false
      } else if (filters.urgency === 'standard') {
        if (urgency !== 'normal') return false
      }
    }

    // Eligibility status filter
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
        // Only strictly compare within identical currency or sort numerically
        if (a.currency === b.currency) {
          return b.fundingAmount - a.fundingAmount
        }
        return b.fundingAmount - a.fundingAmount
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

  const activeFilterCount = useMemo(() => {
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
    if (filters.savedOnly) count++
    return count
  }, [filters])

  const setFilterField = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTER_STATE)
  }, [])

  const clearFilter = useCallback((key: keyof FilterState) => {
    setFilters((prev) => ({ ...prev, [key]: INITIAL_FILTER_STATE[key] }))
  }, [])

  return {
    filters,
    setFilters,
    setFilterField,
    resetFilters,
    clearFilter,
    sortOption,
    setSortOption,
    filteredScholarships: items,
    assessments,
    daysRemainingMap,
    activeFilterCount,
    totalCount: scholarships.length,
    matchedCount: items.length,
  }
}
