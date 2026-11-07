import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Header } from '../../../components/shared/Header'
import { Footer } from '../../../components/shared/Footer'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Card } from '../../../components/ui/Card'
import { ApplicationCard } from '../components/ApplicationCard'
import { ApplicationWorkspaceModal } from '../components/ApplicationWorkspaceModal'
import {
  applicationService,
  APPLICATION_CHANGED_EVENT,
} from '../services/applicationService'
import { DEMO_SCHOLARSHIPS } from '../../scholarships/data/mockScholarships'
import { calculateDaysRemaining } from '../../../lib/utils'
import {
  Compass,
  Search,
  Send,
  Award,
  Clock,
  RotateCcw,
  Plus,
  Layers,
  AlertTriangle,
} from 'lucide-react'
import type {
  TrackedApplication,
  ApplicationStatus,
  ApplicationFilterState,
} from '../types/application'

export function ApplicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [applications, setApplications] = useState<TrackedApplication[]>(() =>
    applicationService.getApplications(),
  )

  const selectedAppId = searchParams.get('appId') || searchParams.get('select')
  const [selectedApplication, setSelectedApplication] = useState<TrackedApplication | null>(() => {
    if (selectedAppId) {
      return (
        applicationService.getApplication(selectedAppId) ||
        applicationService.getApplicationByScholarshipId(selectedAppId) ||
        null
      )
    }
    return null
  })

  // Adjust state during render when URL parameter changes (React pattern)
  const [prevSelectedAppId, setPrevSelectedAppId] = useState(selectedAppId)
  if (selectedAppId !== prevSelectedAppId) {
    setPrevSelectedAppId(selectedAppId)
    if (selectedAppId) {
      const found =
        applicationService.getApplication(selectedAppId) ||
        applicationService.getApplicationByScholarshipId(selectedAppId) ||
        null
      if (found) setSelectedApplication(found)
    } else {
      setSelectedApplication(null)
    }
  }

  const [filters, setFilters] = useState<ApplicationFilterState>({
    searchQuery: '',
    status: (searchParams.get('status') as ApplicationStatus) || 'all',
    urgency: 'all',
    sortBy: 'deadline_asc',
  })

  // Synchronize with application changes
  useEffect(() => {
    const handleApplicationChange = (e: Event) => {
      const customEvent = e as CustomEvent<TrackedApplication[]>
      if (customEvent.detail) {
        setApplications(customEvent.detail)
        if (selectedApplication) {
          const fresh = customEvent.detail.find((a) => a.id === selectedApplication.id)
          if (fresh) setSelectedApplication(fresh)
        }
      }
    }

    window.addEventListener(APPLICATION_CHANGED_EVENT, handleApplicationChange)
    return () => window.removeEventListener(APPLICATION_CHANGED_EVENT, handleApplicationChange)
  }, [selectedApplication])

  // Compute metrics
  const metrics = useMemo(() => {
    const inProgress = applications.filter((a) => a.status === 'in_progress').length
    const submitted = applications.filter((a) => a.status === 'submitted').length
    const underReview = applications.filter((a) => a.status === 'under_review').length
    const accepted = applications.filter((a) => a.status === 'accepted').length
    const planning = applications.filter((a) => a.status === 'planning').length

    let overdue = 0
    let approaching = 0

    for (const app of applications) {
      if (app.status === 'submitted' || app.status === 'accepted' || app.status === 'withdrawn') {
        continue
      }
      const sch = DEMO_SCHOLARSHIPS.find((s) => s.id === app.scholarshipId)
      const deadline = app.targetSubmissionDate || sch?.deadline
      if (deadline) {
        const days = calculateDaysRemaining(deadline)
        if (days < 0) overdue++
        else if (days <= 7) approaching++
      }
    }

    return {
      total: applications.length,
      inProgress,
      submitted,
      underReview,
      accepted,
      planning,
      overdue,
      approaching,
    }
  }, [applications])

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        const sch = DEMO_SCHOLARSHIPS.find((s) => s.id === app.scholarshipId)
        const deadline = app.targetSubmissionDate || sch?.deadline || '2026-12-31'
        const daysRemaining = calculateDaysRemaining(deadline)

        // Search query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase().trim()
          const titleMatch = (sch?.title || '').toLowerCase().includes(q)
          const providerMatch = (sch?.provider || '').toLowerCase().includes(q)
          const notesMatch = app.notes.toLowerCase().includes(q)
          if (!titleMatch && !providerMatch && !notesMatch) return false
        }

        // Status filter
        if (filters.status !== 'all' && app.status !== filters.status) {
          return false
        }

        // Urgency filter
        if (filters.urgency === 'overdue' && daysRemaining >= 0) return false
        if (filters.urgency === 'urgent' && (daysRemaining < 0 || daysRemaining > 7)) return false
        if (filters.urgency === 'approaching' && (daysRemaining < 0 || daysRemaining > 30)) return false

        return true
      })
      .sort((a, b) => {
        const schA = DEMO_SCHOLARSHIPS.find((s) => s.id === a.scholarshipId)
        const schB = DEMO_SCHOLARSHIPS.find((s) => s.id === b.scholarshipId)
        const deadA = a.targetSubmissionDate || schA?.deadline || '2099-12-31'
        const deadB = b.targetSubmissionDate || schB?.deadline || '2099-12-31'

        switch (filters.sortBy) {
          case 'deadline_asc':
            return deadA.localeCompare(deadB)
          case 'deadline_desc':
            return deadB.localeCompare(deadA)
          case 'title_asc':
            return (schA?.title || '').localeCompare(schB?.title || '')
          case 'amount_desc':
            return (schB?.fundingAmount || 0) - (schA?.fundingAmount || 0)
          case 'updated_desc':
          default:
            return b.updatedAt.localeCompare(a.updatedAt)
        }
      })
  }, [applications, filters])

  const handleOpenWorkspace = (app: TrackedApplication) => {
    setSelectedApplication(app)
    setSearchParams({ appId: app.id })
  }

  const handleCloseWorkspace = () => {
    setSelectedApplication(null)
    setSearchParams({})
  }

  const handleQuickAdvance = (app: TrackedApplication) => {
    let nextStatus: ApplicationStatus = 'in_progress'
    if (app.status === 'planning') nextStatus = 'in_progress'
    else if (app.status === 'in_progress') nextStatus = 'submitted'
    else if (app.status === 'submitted') nextStatus = 'under_review'
    else if (app.status === 'under_review') nextStatus = 'accepted'

    applicationService.updateStatus(app.id, nextStatus)
    setApplications(applicationService.getApplications())
  }

  const statusFilterTabs: { key: 'all' | ApplicationStatus; label: string; count?: number }[] = [
    { key: 'all', label: 'All Applications', count: metrics.total },
    { key: 'planning', label: 'Planning', count: metrics.planning },
    { key: 'in_progress', label: 'In Progress', count: metrics.inProgress },
    { key: 'submitted', label: 'Submitted', count: metrics.submitted },
    { key: 'under_review', label: 'Under Review', count: metrics.underReview },
    { key: 'accepted', label: 'Awarded', count: metrics.accepted },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-warm-50 text-warm-900">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-warm-500">
              <Link to="/dashboard" className="hover:text-forest-900">
                Dashboard
              </Link>
              <span>/</span>
              <span className="font-semibold text-forest-900">Application Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-forest-900">
              Application Management Workspace
            </h1>
            <p className="text-xs text-warm-600 max-w-2xl leading-relaxed">
              Track lifecycle milestones, document readiness, personal notes, and submission targets
              across your active educational funding applications.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/scholarships">
              <Button
                variant="outline"
                size="md"
                icon={<Compass className="w-4 h-4 text-forest-700" />}
              >
                Discover Scholarships
              </Button>
            </Link>
            <Link to="/scholarships">
              <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
                Track New Scholarship
              </Button>
            </Link>
          </div>
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card variant="default" className="p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-warm-500">Tracked Total</span>
            <p className="text-xl font-bold text-forest-900">{metrics.total}</p>
          </Card>
          <Card variant="default" className="p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-amber-accent flex items-center gap-1">
              <Clock className="w-3 h-3" />
              In Progress
            </span>
            <p className="text-xl font-bold text-forest-900">{metrics.inProgress}</p>
          </Card>
          <Card variant="default" className="p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-forest-800 flex items-center gap-1">
              <Send className="w-3 h-3 text-emerald-600" />
              Submitted
            </span>
            <p className="text-xl font-bold text-forest-900">{metrics.submitted}</p>
          </Card>
          <Card variant="default" className="p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-sky-700 flex items-center gap-1">
              <Search className="w-3 h-3" />
              Under Review
            </span>
            <p className="text-xl font-bold text-forest-900">{metrics.underReview}</p>
          </Card>
          <Card variant="default" className="p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
              <Award className="w-3 h-3" />
              Awarded
            </span>
            <p className="text-xl font-bold text-forest-900">{metrics.accepted}</p>
          </Card>
          <Card
            variant="default"
            className={`p-3.5 space-y-1 ${
              metrics.overdue > 0 || metrics.approaching > 0
                ? 'border-rose-300 bg-rose-50/40'
                : ''
            }`}
          >
            <span className="text-[11px] font-semibold text-rose-700 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Urgent / Due
            </span>
            <p className="text-xl font-bold text-rose-900">
              {metrics.overdue + metrics.approaching}
            </p>
          </Card>
        </div>

        {/* Search, Filter Pills & Sort Bar */}
        <div className="p-4 bg-white rounded-2xl border border-warm-300 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="w-full sm:w-80">
              <Input
                placeholder="Search tracked scholarships, providers, or notes..."
                value={filters.searchQuery}
                onChange={(e) => setFilters((f) => ({ ...f, searchQuery: e.target.value }))}
                clearable
                onClear={() => setFilters((f) => ({ ...f, searchQuery: '' }))}
                icon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* Sort & Urgency Selectors */}
            <div className="flex items-center gap-2">
              <select
                aria-label="Filter by deadline urgency"
                value={filters.urgency}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    urgency: e.target.value as ApplicationFilterState['urgency'],
                  }))
                }
                className="bg-warm-50 border border-warm-300 rounded-xl px-3 py-2 text-xs text-warm-900 focus-visible:outline-none focus-visible:border-forest-700 cursor-pointer"
              >
                <option value="all">All Deadlines</option>
                <option value="urgent">Due within 7 Days</option>
                <option value="approaching">Due within 30 Days</option>
                <option value="overdue">Overdue Deadlines</option>
              </select>

              <select
                aria-label="Sort applications"
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    sortBy: e.target.value as ApplicationFilterState['sortBy'],
                  }))
                }
                className="bg-warm-50 border border-warm-300 rounded-xl px-3 py-2 text-xs text-warm-900 focus-visible:outline-none focus-visible:border-forest-700 cursor-pointer"
              >
                <option value="deadline_asc">Nearest Deadline (Soonest first)</option>
                <option value="deadline_desc">Latest Deadline</option>
                <option value="amount_desc">Funding Amount (High to Low)</option>
                <option value="title_asc">Alphabetical (A to Z)</option>
                <option value="updated_desc">Recently Updated</option>
              </select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
            {statusFilterTabs.map((tab) => {
              const isActive = filters.status === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, status: tab.key }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-forest-900 text-white shadow-xs'
                      : 'bg-warm-100/60 text-warm-700 hover:bg-warm-200 border border-warm-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-forest-800 text-emerald-300' : 'bg-warm-200 text-warm-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Applications Grid / Empty State */}
        {filteredApplications.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-warm-300 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-warm-100 text-warm-500 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-forest-900">
                {applications.length === 0
                  ? 'Your application pipeline is currently empty.'
                  : 'No applications match your active filters.'}
              </h3>
              <p className="text-xs text-warm-600 max-w-md mx-auto leading-relaxed">
                {applications.length === 0
                  ? 'Explore our catalog of international scholarships and click "Track Application" to organize your submission checklist, target dates, and documents.'
                  : 'Try selecting a different status filter or clearing your search term.'}
              </p>
            </div>

            {applications.length === 0 ? (
              <Link to="/scholarships">
                <Button variant="primary" size="md" icon={<Compass className="w-4 h-4" />}>
                  Discover Scholarships to Track
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                size="md"
                onClick={() =>
                  setFilters({
                    searchQuery: '',
                    status: 'all',
                    urgency: 'all',
                    sortBy: 'deadline_asc',
                  })
                }
                icon={<RotateCcw className="w-4 h-4" />}
              >
                Reset Filter Settings
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApplications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onOpenWorkspace={handleOpenWorkspace}
                onQuickAdvanceStatus={handleQuickAdvance}
              />
            ))}
          </div>
        )}
      </main>

      {/* Application Workspace Modal */}
      <ApplicationWorkspaceModal
        application={selectedApplication}
        isOpen={Boolean(selectedApplication)}
        onClose={handleCloseWorkspace}
        onUpdate={() => setApplications(applicationService.getApplications())}
        onUntrack={() => setApplications(applicationService.getApplications())}
      />

      <Footer />
    </div>
  )
}
