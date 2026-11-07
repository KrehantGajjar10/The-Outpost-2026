import { useState, useMemo, useCallback, useEffect } from 'react'
import type { Scholarship, ScholarshipCategory } from '../features/scholarships/types/scholarship'
import type { DashboardMetrics, DashboardNotification, ScholarshipFilters } from '../features/dashboard/types/dashboard'
import { INITIAL_DEMO_SCHOLARSHIPS } from '../features/dashboard/data/mockScholarships'
import { INITIAL_DEMO_NOTIFICATIONS } from '../features/dashboard/data/mockNotifications'
import { savedService, SAVED_CHANGED_EVENT } from '../features/saved/services/savedService'
import { formatCurrency, calculateDaysRemaining, getUrgencyLevel } from '../lib/utils'

export function useScholarshipPipeline() {
  const [scholarships] = useState(INITIAL_DEMO_SCHOLARSHIPS)
  const [savedIds, setSavedIds] = useState<string[]>(() => savedService.getSavedIds())
  const [notifications, setNotifications] = useState<DashboardNotification[]>(INITIAL_DEMO_NOTIFICATIONS)
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null)
  const [filters, setFilters] = useState<ScholarshipFilters>({
    searchQuery: '',
    category: 'all',
    status: 'all',
    urgency: 'all',
  })

  // Synchronize saved state with localStorage
  useEffect(() => {
    const handleSavedChange = (e: Event) => {
      const customEvent = e as CustomEvent<string[]>
      if (customEvent.detail) {
        setSavedIds(customEvent.detail)
      }
    }
    window.addEventListener(SAVED_CHANGED_EVENT, handleSavedChange)
    return () => window.removeEventListener(SAVED_CHANGED_EVENT, handleSavedChange)
  }, [])

  // Toggle saved bookmark for a scholarship without mutating application status
  const toggleSaveScholarship = useCallback((id: string) => {
    savedService.toggle(id)
    setSavedIds(savedService.getSavedIds())
  }, [])

  // Mark a notification as read
  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  // Map scholarships with real-time dynamic deadline calculation and saved status
  const dynamicScholarships = useMemo(() => {
    return scholarships.map((sch) => {
      const days = calculateDaysRemaining(sch.deadline)
      const isSaved = savedIds.includes(sch.id)
      return {
        ...sch,
        daysRemaining: days,
        urgency: getUrgencyLevel(days),
        isSaved,
      }
    })
  }, [scholarships, savedIds])

  // Filtered scholarships
  const filteredScholarships = useMemo(() => {
    return dynamicScholarships.filter((item) => {
      // Search query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim()
        const matchesTitle = item.title.toLowerCase().includes(query)
        const matchesProvider = item.provider.toLowerCase().includes(query)
        const matchesCategory = item.categoryLabel.toLowerCase().includes(query)
        if (!matchesTitle && !matchesProvider && !matchesCategory) return false
      }

      // Category filter
      if (filters.category !== 'all' && item.category !== filters.category) {
        return false
      }

      // Status filter (saved vs in_progress)
      if (filters.status !== 'all') {
        if (filters.status === 'saved' && !item.isSaved) return false
        if (filters.status === 'in_progress' && item.status !== 'in_progress') return false
      }

      // Urgency filter
      if (filters.urgency !== 'all') {
        if (item.urgency !== filters.urgency) return false
      }

      return true
    })
  }, [dynamicScholarships, filters])

  // Grounded metrics computed dynamically from current saved/tracked items
  const metrics: DashboardMetrics = useMemo(() => {
    const trackedApplications = dynamicScholarships.filter(
      (s) => s.status === 'in_progress' || s.status === 'submitted',
    )
    const bookmarkedOpportunities = dynamicScholarships.filter((s) => s.isSaved)

    // Only include active deadlines (not expired)
    const activeTracked = dynamicScholarships
      .filter((s) => (s.isSaved || s.status === 'in_progress') && s.daysRemaining !== undefined && s.daysRemaining >= 0)
      .sort((a, b) => (a.daysRemaining ?? 0) - (b.daysRemaining ?? 0))

    const within30Days = activeTracked.filter((s) => (s.daysRemaining ?? 0) <= 30)

    // Sum USD funding accurately without conflating different currencies
    const totalFunding = dynamicScholarships
      .filter((s) => s.isSaved || s.status === 'in_progress')
      .reduce((acc, curr) => acc + (curr.amount || curr.fundingAmount || 0), 0)

    const nearest = activeTracked[0]

    return {
      totalSaved: bookmarkedOpportunities.length,
      inProgressCount: trackedApplications.length,
      upcomingDeadlinesCount: within30Days.length,
      totalPotentialFunding: totalFunding,
      formattedPotentialFunding: formatCurrency(totalFunding, 'USD'),
      nearestDeadlineDays: nearest ? (nearest.daysRemaining ?? 0) : 0,
      nearestScholarshipTitle: nearest ? nearest.title : 'None pending',
    }
  }, [dynamicScholarships])

  const setCategoryFilter = useCallback((category: 'all' | ScholarshipCategory) => {
    setFilters((prev) => ({ ...prev, category }))
  }, [])

  const setSearchQuery = useCallback((searchQuery: string) => {
    setFilters((prev) => ({ ...prev, searchQuery }))
  }, [])

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  return {
    scholarships: dynamicScholarships,
    filteredScholarships,
    selectedScholarship,
    setSelectedScholarship,
    filters,
    setFilters,
    setCategoryFilter,
    setSearchQuery,
    toggleSaveScholarship,
    metrics,
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    savedIds,
  }
}
