import { useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { WelcomeSection } from '../components/WelcomeSection'
import { OverviewMetrics } from '../components/OverviewMetrics'
import { OpportunityList } from '../components/OpportunityList'
import { DeadlinesTimeline } from '../components/DeadlinesTimeline'
import { InsightsSection } from '../components/InsightsSection'
import { ScholarshipDetailModal } from '../components/ScholarshipDetailModal'
import { useScholarshipPipeline } from '../../../hooks/useScholarshipPipeline'

export function DashboardPage() {
  const [activeSection, setActiveSection] = useState('overview')
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
    >
      <div className="space-y-8">
        {/* Welcome Banner */}
        <WelcomeSection
          metrics={metrics}
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
          // Update selected modal object if open
          setSelectedScholarship((curr) => {
            if (!curr || curr.id !== id) return curr
            const isCurrentlySaved = curr.status === 'saved' || curr.status === 'in_progress'
            return {
              ...curr,
              status: isCurrentlySaved ? 'recommended' : 'saved',
            }
          })
        }}
      />
    </DashboardLayout>
  )
}
