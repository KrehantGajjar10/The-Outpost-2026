import { useState, useEffect } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { WelcomeSection } from '../components/WelcomeSection'
import { OverviewMetrics } from '../components/OverviewMetrics'
import { OpportunityList } from '../components/OpportunityList'
import { DeadlinesTimeline } from '../components/DeadlinesTimeline'
import { InsightsSection } from '../components/InsightsSection'
import { ScholarshipDetailModal } from '../components/ScholarshipDetailModal'
import { useScholarshipPipeline } from '../../../hooks/useScholarshipPipeline'
import { profileService, PROFILE_CHANGED_EVENT } from '../../profile/services/profileService'
import type { StudentProfile } from '../../profile/types/profile'

export function DashboardPage() {
  const [activeSection, setActiveSection] = useState('overview')
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => profileService.getProfile())

  useEffect(() => {
    const handleProfileChange = (e: Event) => {
      const customEvent = e as CustomEvent<StudentProfile>
      if (customEvent.detail) {
        setStudentProfile(customEvent.detail)
      }
    }
    window.addEventListener(PROFILE_CHANGED_EVENT, handleProfileChange)
    return () => window.removeEventListener(PROFILE_CHANGED_EVENT, handleProfileChange)
  }, [])
  const {
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
  } = useScholarshipPipeline()

  const handleSelectScholarshipById = (id: string) => {
    const found = scholarships.find((s) => s.id === id)
    if (found) {
      setSelectedScholarship(found)
    }
  }

  const handleJumpToDeadlines = () => {
    setActiveSection('deadlines')
    const el = document.querySelector('#deadlines')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleFilterInProgress = () => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status === 'in_progress' ? 'all' : 'in_progress',
    }))
    const el = document.querySelector('#opportunities')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleSelectMetric = (metricType: 'saved' | 'in_progress' | 'deadlines') => {
    if (metricType === 'deadlines') {
      handleJumpToDeadlines()
    } else if (metricType === 'saved') {
      setFilters((prev) => ({
        ...prev,
        status: prev.status === 'saved' ? 'all' : 'saved',
      }))
      const el = document.querySelector('#opportunities')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else if (metricType === 'in_progress') {
      handleFilterInProgress()
    }
  }

  return (
    <DashboardLayout
      notifications={notifications}
      unreadCount={unreadNotificationsCount}
      onMarkRead={markNotificationRead}
      onMarkAllRead={markAllNotificationsRead}
      onSelectScholarshipById={handleSelectScholarshipById}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      profile={studentProfile}
    >
      <div className="space-y-8">
        {/* Welcome Banner */}
        <WelcomeSection
          metrics={metrics}
          profile={studentProfile}
          onJumpToDeadlines={handleJumpToDeadlines}
          onFilterInProgress={handleFilterInProgress}
        />

        {/* Overview Metric Cards */}
        <OverviewMetrics metrics={metrics} onSelectMetric={handleSelectMetric} />

        {/* Recommended Opportunities List & Filter */}
        <OpportunityList
          scholarships={filteredScholarships}
          filters={filters}
          onSearchChange={setSearchQuery}
          onCategoryChange={setCategoryFilter}
          onSelectScholarship={setSelectedScholarship}
          onToggleSave={toggleSaveScholarship}
        />

        {/* Deadlines Timeline */}
        <DeadlinesTimeline
          scholarships={scholarships}
          onSelectScholarship={setSelectedScholarship}
        />

        {/* Insights & Financial Distribution */}
        <InsightsSection scholarships={scholarships} />
      </div>

      {/* Scholarship Detail Modal */}
      <ScholarshipDetailModal
        scholarship={selectedScholarship}
        isOpen={Boolean(selectedScholarship)}
        onClose={() => setSelectedScholarship(null)}
        onToggleSave={(id) => {
          toggleSaveScholarship(id)
          setSelectedScholarship((curr) => {
            if (!curr || curr.id !== id) return curr
            return {
              ...curr,
              isSaved: !curr.isSaved,
            }
          })
        }}
      />
    </DashboardLayout>
  )
}
