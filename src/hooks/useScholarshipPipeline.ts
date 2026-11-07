import { useState, useMemo, useCallback } from 'react'
import type { Scholarship, ScholarshipCategory } from '../features/scholarships/types/scholarship'
import type { DashboardMetrics, DashboardNotification, ScholarshipFilters } from '../features/dashboard/types/dashboard'
import { INITIAL_DEMO_SCHOLARSHIPS } from '../features/dashboard/data/mockScholarships'
import { INITIAL_DEMO_NOTIFICATIONS } from '../features/dashboard/data/mockNotifications'
import { formatCurrency } from '../lib/utils'

export function useScholarshipPipeline() {
  const [scholarships, setScholarships] = useState<Scholarship[]>(INITIAL_DEMO_SCHOLARSHIPS)
  const [notifications, setNotifications] = useState<DashboardNotification[]>(INITIAL_DEMO_NOTIFICATIONS)
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null)
  const [filters, setFilters] = useState<ScholarshipFilters>({
    searchQuery: '',
    category: 'all',
    status: 'all',
    urgency: 'all',
  })

  // Toggle saved status for a scholarship
  const toggleSaveScholarship = useCallback((id: string) => {
    setScholarships((prev) =>
      prev.map((sch) => {
        if (sch.id !== id) return sch
        if (sch.status === 'recommended') {
          return { ...sch, status: 'saved' as const }
        }
        if (sch.status === 'saved') {
          return { ...sch, status: 'recommended' as const }
        }
        // If in_progress, keep it as in_progress
        return sch
      }),
    )
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

  // Filtered scholarships
  const filteredScholarships = useMemo(() => {
    return scholarships.filter((item) => {
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

      // Status filter
      if (filters.status !== 'all' && item.status !== filters.status) {
        return false
      }

      // Urgency filter
      if (filters.urgency !== 'all' && item.urgency !== filters.urgency) {
        return false
      }

      return true
    })
  }, [scholarships, filters])

  // Grounded metrics computed from current state
  const metrics: DashboardMetrics = useMemo(() => {
    const savedOrTracked = scholarships.filter(
      (s) => s.status === 'saved' || s.status === 'in_progress' || s.status === 'submitted',
    )
    const inProgress = scholarships.filter((s) => s.status === 'in_progress')
    
    // Sort saved/tracked by days remaining
    const upcomingDeadlines = [...savedOrTracked].sort(
      (a, b) => a.daysRemaining - b.daysRemaining,
    )
    
    const within30Days = savedOrTracked.filter((s) => s.daysRemaining <= 30)

    const totalFunding = savedOrTracked.reduce((acc, curr) => acc + curr.amount, 0)
    const nearest = upcomingDeadlines[0]

    return {
      totalSaved: savedOrTracked.length,
      inProgressCount: inProgress.length,
      upcomingDeadlinesCount: within30Days.length,
      totalPotentialFunding: totalFunding,
      formattedPotentialFunding: formatCurrency(totalFunding),
      nearestDeadlineDays: nearest ? nearest.daysRemaining : 0,
      nearestScholarshipTitle: nearest ? nearest.title : 'None pending',
    }
  }, [scholarships])

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
    scholarships,
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
  }
}
