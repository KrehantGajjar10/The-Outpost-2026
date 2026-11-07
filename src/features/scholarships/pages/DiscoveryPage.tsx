import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Header } from '../../../components/shared/Header'
import { Footer } from '../../../components/shared/Footer'
import { DemoNotice } from '../../../components/shared/DemoNotice'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { ScholarshipCard } from '../components/ScholarshipCard'
import { ScholarshipFilterDrawer } from '../components/ScholarshipFilterDrawer'
import { ScholarshipDetailsView } from '../components/ScholarshipDetailsView'
import { DEMO_SCHOLARSHIPS } from '../data/mockScholarships'
import { useScholarshipFilters, type SortOption } from '../hooks/useScholarshipFilters'
import { savedService, SAVED_CHANGED_EVENT } from '../../saved/services/savedService'
import { profileService, PROFILE_CHANGED_EVENT } from '../../profile/services/profileService'
import type { Scholarship } from '../types/scholarship'
import type { StudentProfile } from '../../profile/types/profile'
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Command,
  User,
  X,
  Bookmark,
} from 'lucide-react'

export function DiscoveryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [profile, setProfile] = useState<StudentProfile>(() => profileService.getProfile())
  const [savedIds, setSavedIds] = useState<string[]>(() => savedService.getSavedIds())
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const selectId = searchParams.get('select')
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(() => {
    if (selectId) {
      return DEMO_SCHOLARSHIPS.find((s) => s.id === selectId) || null
    }
    return null
  })
  const [prevSelectId, setPrevSelectId] = useState(selectId)
  if (selectId !== prevSelectId) {
    setPrevSelectId(selectId)
    if (selectId) {
      const found = DEMO_SCHOLARSHIPS.find((s) => s.id === selectId)
      if (found) setSelectedScholarship(found)
    }
  }
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Listen to profile and saved changes
  useEffect(() => {
    const handleProfileChange = (e: Event) => {
      const customEvent = e as CustomEvent<StudentProfile>
      if (customEvent.detail) setProfile(customEvent.detail)
    }
    const handleSavedChange = (e: Event) => {
      const customEvent = e as CustomEvent<string[]>
      if (customEvent.detail) setSavedIds(customEvent.detail)
    }

    window.addEventListener(PROFILE_CHANGED_EVENT, handleProfileChange)
    window.addEventListener(SAVED_CHANGED_EVENT, handleSavedChange)
    return () => {
      window.removeEventListener(PROFILE_CHANGED_EVENT, handleProfileChange)
      window.removeEventListener(SAVED_CHANGED_EVENT, handleSavedChange)
    }
  }, [])

  const {
    filters,
    setFilterField,
    resetFilters,
    clearFilter,
    sortOption,
    setSortOption,
    filteredScholarships,
    assessments,
    activeFilterCount,
    totalCount,
    matchedCount,
  } = useScholarshipFilters(DEMO_SCHOLARSHIPS, savedIds, profile, {
    savedOnly: searchParams.get('saved') === 'true',
  })

  // Keyboard shortcut: '/' to focus search field when not typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      if (e.key === '/' && !isInput) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleToggleSave = (id: string) => {
    savedService.toggle(id)
    setSavedIds(savedService.getSavedIds())
  }

  return (
    <div className="min-h-screen flex flex-col bg-warm-50 text-warm-900">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Breadcrumb & Quick Jump */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-warm-200">
          <div className="flex items-center gap-2 text-xs text-warm-600">
            <Link to="/" className="hover:text-forest-900">
              Home
            </Link>
            <span>/</span>
            <span className="font-semibold text-forest-900">Find Scholarships</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('grantly:open_command_palette'))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-warm-300 text-warm-700 hover:border-forest-700 cursor-pointer shadow-2xs"
            >
              <Command className="w-3.5 h-3.5 text-forest-700" />
              <span>Command Palette</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-warm-100 rounded border border-warm-300">
                ⌘K
              </kbd>
            </button>

            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-50 border border-emerald-200 text-forest-800 font-semibold hover:bg-forest-100"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Profile ({profile.countryOfResidence} • {profile.academicScore.label || `${profile.academicScore.value} GPA`})</span>
            </Link>
          </div>
        </div>

        {/* Demo Notice */}
        <DemoNotice />

        {/* Page Heading & Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-emerald-200 text-xs font-semibold text-forest-800">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Deterministic Eligibility Matching</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-forest-900">
                Scholarship Discovery Directory
              </h1>
              <p className="text-sm text-warm-600 max-w-2xl leading-relaxed">
                Discover educational financial assistance matching your location, education level, and grading scale. Filter by award structure, currency, or eligibility classification.
              </p>
            </div>

            {/* Bookmarked Quick Filter Tab */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const nextSaved = !filters.savedOnly
                  setFilterField('savedOnly', nextSaved)
                  setSearchParams(nextSaved ? { saved: 'true' } : {})
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer border ${
                  filters.savedOnly
                    ? 'bg-forest-900 text-white border-forest-900 shadow-xs'
                    : 'bg-white text-warm-700 border-warm-300 hover:bg-warm-100'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${filters.savedOnly ? 'fill-white' : ''}`} />
                <span>Saved Pipeline ({savedIds.length})</span>
              </button>
            </div>
          </div>

          {/* Search Bar with Keyboard indicator */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Input
                ref={searchInputRef}
                placeholder="Search by scholarship title, provider, field, keywords or tags... (Press '/' to focus)"
                value={filters.searchQuery}
                onChange={(e) => setFilterField('searchQuery', e.target.value)}
                clearable
                onClear={() => setFilterField('searchQuery', '')}
                icon={<Search className="w-4 h-4 text-warm-500" />}
                className="py-3 text-sm"
              />
            </div>

            {/* Mobile Filter Trigger Button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white border border-warm-300 rounded-xl text-xs font-semibold text-warm-700 hover:border-forest-700 cursor-pointer shadow-xs"
            >
              <Filter className="w-4 h-4 text-forest-700" />
              <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
            </button>
          </div>

          {/* Active Filter Chips Row */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-warm-500 font-medium">Active Filters:</span>

              {filters.searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-warm-100 text-warm-800 border border-warm-300">
                  Search: "{filters.searchQuery}"
                  <button
                    type="button"
                    onClick={() => clearFilter('searchQuery')}
                    className="hover:text-rose-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.country !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-warm-100 text-warm-800 border border-warm-300">
                  Country: {filters.country}
                  <button
                    type="button"
                    onClick={() => clearFilter('country')}
                    className="hover:text-rose-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.educationLevel !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-warm-100 text-warm-800 border border-warm-300 capitalize">
                  Level: {filters.educationLevel}
                  <button
                    type="button"
                    onClick={() => clearFilter('educationLevel')}
                    className="hover:text-rose-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.category !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-warm-100 text-warm-800 border border-warm-300 capitalize">
                  Category: {filters.category}
                  <button
                    type="button"
                    onClick={() => clearFilter('category')}
                    className="hover:text-rose-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.currency !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-warm-100 text-warm-800 border border-warm-300">
                  Currency: {filters.currency}
                  <button
                    type="button"
                    onClick={() => clearFilter('currency')}
                    className="hover:text-rose-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.awardType !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-warm-100 text-warm-800 border border-warm-300 capitalize">
                  Award: {filters.awardType}
                  <button
                    type="button"
                    onClick={() => clearFilter('awardType')}
                    className="hover:text-rose-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.urgency !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-warm-100 text-warm-800 border border-warm-300 capitalize">
                  Urgency: {filters.urgency}
                  <button
                    type="button"
                    onClick={() => clearFilter('urgency')}
                    className="hover:text-rose-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.eligibilityStatus !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-warm-100 text-warm-800 border border-warm-300">
                  Match: {filters.eligibilityStatus.replace('_', ' ')}
                  <button
                    type="button"
                    onClick={() => clearFilter('eligibilityStatus')}
                    className="hover:text-rose-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.savedOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-forest-100 text-forest-900 border border-emerald-300">
                  Saved Only
                  <button
                    type="button"
                    onClick={() => clearFilter('savedOnly')}
                    className="hover:text-rose-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1 ml-2 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            </div>
          )}
        </div>

        {/* Discovery Layout: Filter Sidebar + Scholarship Cards Grid */}
        <div className="flex items-start gap-8">
          {/* Filter Drawer / Sidebar */}
          <ScholarshipFilterDrawer
            isOpen={mobileFilterOpen}
            onClose={() => setMobileFilterOpen(false)}
            filters={filters}
            onFilterChange={setFilterField}
            onReset={resetFilters}
            activeCount={activeFilterCount}
            totalCount={totalCount}
            matchedCount={matchedCount}
          />

          {/* Results Area */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Results Header: Count & Sorting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-warm-200">
              <p className="text-xs font-semibold text-warm-600">
                Showing <strong className="text-forest-900 font-bold">{matchedCount}</strong> of{' '}
                {totalCount} available scholarships
              </p>

              <div className="flex items-center gap-2 text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-warm-500" />
                <label htmlFor="sort-select" className="text-warm-600 font-medium">
                  Sort by:
                </label>
                <select
                  id="sort-select"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="rounded-xl bg-white border border-warm-300 px-3 py-1.5 text-xs text-warm-900 focus-visible:border-forest-700 focus-visible:outline-none cursor-pointer"
                >
                  <option value="deadline_asc">Nearest Deadline (Active first)</option>
                  <option value="deadline_desc">Latest Deadline</option>
                  <option value="match_desc">Best Eligibility Match</option>
                  <option value="amount_desc">Funding Amount (Comparable)</option>
                  <option value="title_asc">Alphabetical (A to Z)</option>
                </select>
              </div>
            </div>

            {/* Empty State */}
            {filteredScholarships.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-warm-300 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-warm-100 text-warm-500 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-forest-900">
                    No scholarships match your active filters.
                  </h3>
                  <p className="text-xs text-warm-600 max-w-md mx-auto leading-relaxed">
                    Try broadening your search keywords, resetting currency constraints, or removing country requirements.
                  </p>
                </div>
                <Button variant="outline" size="md" onClick={resetFilters} icon={<RotateCcw className="w-4 h-4" />}>
                  Reset All Filters
                </Button>
              </div>
            ) : (
              /* Scholarship Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredScholarships.map((sch) => (
                  <ScholarshipCard
                    key={sch.id}
                    scholarship={sch}
                    assessment={assessments.get(sch.id)}
                    isSaved={savedIds.includes(sch.id)}
                    onToggleSave={handleToggleSave}
                    onSelect={setSelectedScholarship}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Scholarship Detail Modal */}
      <ScholarshipDetailsView
        scholarship={selectedScholarship}
        assessment={selectedScholarship ? assessments.get(selectedScholarship.id) : undefined}
        isOpen={Boolean(selectedScholarship)}
        onClose={() => setSelectedScholarship(null)}
        isSaved={selectedScholarship ? savedIds.includes(selectedScholarship.id) : false}
        onToggleSave={handleToggleSave}
      />

      <Footer />
    </div>
  )
}
