import { useState, useMemo, useCallback, useEffect } from 'react'
import type { Scholarship, ScholarshipCategory } from '../features/scholarships/types/scholarship'
import type { DashboardMetrics, DashboardNotification, ScholarshipFilters } from '../features/dashboard/types/dashboard'
import { INITIAL_DEMO_SCHOLARSHIPS } from '../features/dashboard/data/mockScholarships'
import { savedService, SAVED_CHANGED_EVENT } from '../features/saved/services/savedService'
import {
  applicationService,
  APPLICATION_CHANGED_EVENT,
} from '../features/applications/services/applicationService'
import type { TrackedApplication } from '../features/applications/types/application'
import {
  notificationService,
  NOTIFICATIONS_CHANGED_EVENT,
} from '../services/notificationService'
import { formatCurrency, calculateDaysRemaining, getUrgencyLevel } from '../lib/utils'

export function useScholarshipPipeline() {
  const [scholarships] = useState(INITIAL_DEMO_SCHOLARSHIPS)
  const [savedIds, setSavedIds] = useState<string[]>(() => savedService.getSavedIds())
  const [applications, setApplications] = useState<TrackedApplication[]>(() =>
    applicationService.getApplications(),
  )
  const [notifications, setNotifications] = useState<DashboardNotification[]>(() =>
    notificationService.getNotifications(),
  )
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null)
  const [filters, setFilters] = useState<ScholarshipFilters>({
    searchQuery: '',
    category: 'all',
    status: 'all',
    urgency: 'all',
  })

  // Synchronize saved state, applications, and notifications with localStorage
  useEffect(() => {
    const handleSavedChange = (e: Event) => {
      const customEvent = e as CustomEvent<string[]>
      if (customEvent.detail) {
        setSavedIds(customEvent.detail)
      }
    }

    const handleApplicationChange = (e: Event) => {
      const customEvent = e as CustomEvent<TrackedApplication[]>
      if (customEvent.detail) {
        setApplications(customEvent.detail)
        notificationService.syncDeadlineNotifications(customEvent.detail)
      }
    }

    const handleNotificationChange = (e: Event) => {
      const customEvent = e as CustomEvent<DashboardNotification[]>
      if (customEvent.detail) {
        setNotifications(customEvent.detail)
      }
    }

    window.addEventListener(SAVED_CHANGED_EVENT, handleSavedChange)
    window.addEventListener(APPLICATION_CHANGED_EVENT, handleApplicationChange)
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, handleNotificationChange)

    // Initial check for upcoming / overdue deadlines
    notificationService.syncDeadlineNotifications(applications)

    return () => {
      window.removeEventListener(SAVED_CHANGED_EVENT, handleSavedChange)
      window.removeEventListener(APPLICATION_CHANGED_EVENT, handleApplicationChange)
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, handleNotificationChange)
    }
  }, [applications])

  // Toggle saved bookmark for a scholarship without mutating application status
  const toggleSaveScholarship = useCallback((id: string) => {
    savedService.toggle(id)
    setSavedIds(savedService.getSavedIds())
  }, [])

  // Mark a notification as read
  const markNotificationRead = useCallback((id: string) => {
    notificationService.markAsRead(id)
    setNotifications(notificationService.getNotifications())
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    notificationService.markAllAsRead()
    setNotifications(notificationService.getNotifications())
  }, [])

  // Map scholarships with real-time dynamic deadline calculation, saved status, and application status
  const dynamicScholarships = useMemo(() => {
    const appMap = new Map(applications.map((a) => [a.scholarshipId, a]))

    return scholarships.map((sch) => {
      const app = appMap.get(sch.id)
      const effectiveDeadline = app?.targetSubmissionDate || sch.deadline
      const days = calculateDaysRemaining(effectiveDeadline)
      const isSaved = savedIds.includes(sch.id)

      // When tracked, reflect dynamic requirements checklist from user application
      const requirements = app
        ? app.documents.map((d) => ({
            id: d.id,
            label: d.title,
            completed: d.status === 'ready',
          }))
        : sch.requirements

      return {
        ...sch,
        deadline: effectiveDeadline,
        daysRemaining: days,
        urgency: getUrgencyLevel(days),
        isSaved,
        status: app ? (app.status as Scholarship['status']) : sch.status,
        currentStage: app?.customStageLabel || sch.currentStage,
        requirements,
      }
    })
  }, [scholarships, savedIds, applications])

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

  // Grounded metrics computed dynamically from current saved and tracked applications
  const metrics: DashboardMetrics = useMemo(() => {
    const inProgressApps = applications.filter((a) => a.status === 'in_progress')
    const submittedApps = applications.filter((a) => a.status === 'submitted')
    const underReviewApps = applications.filter((a) => a.status === 'under_review')
    const acceptedApps = applications.filter((a) => a.status === 'accepted')
    const bookmarkedOpportunities = dynamicScholarships.filter((s) => s.isSaved)

    // Active tracked deadlines (not expired, and not already completed/withdrawn)
    const activeTracked = dynamicScholarships
      .filter((s) => {
        const isTracked = applications.some((a) => a.scholarshipId === s.id && a.status !== 'withdrawn' && a.status !== 'rejected')
        return (s.isSaved || isTracked) && s.daysRemaining !== undefined && s.daysRemaining >= 0
      })
      .sort((a, b) => (a.daysRemaining ?? 0) - (b.daysRemaining ?? 0))

    const within30Days = activeTracked.filter((s) => (s.daysRemaining ?? 0) <= 30)

    // Sum USD funding accurately without conflating different currencies
    const usdTracked = dynamicScholarships.filter((s) => {
      const isTracked = applications.some((a) => a.scholarshipId === s.id)
      return (s.isSaved || isTracked) && s.currency === 'USD'
    })

    const totalFundingUSD = usdTracked.reduce(
      (acc, curr) => acc + (curr.fundingAmount || curr.amount || 0),
      0,
    )

    const nearest = activeTracked[0]

    return {
      totalSaved: bookmarkedOpportunities.length,
      inProgressCount: inProgressApps.length,
      submittedCount: submittedApps.length,
      underReviewCount: underReviewApps.length,
      acceptedCount: acceptedApps.length,
      upcomingDeadlinesCount: within30Days.length,
      totalPotentialFunding: totalFundingUSD,
      formattedPotentialFunding: formatCurrency(totalFundingUSD, 'USD'),
      nearestDeadlineDays: nearest ? (nearest.daysRemaining ?? 0) : 0,
      nearestScholarshipTitle: nearest ? nearest.title : 'None pending',
    }
  }, [dynamicScholarships, applications])

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
    applications,
  }
}
