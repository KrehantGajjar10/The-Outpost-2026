import { Filter, X, RotateCcw } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import type { FilterState } from '../hooks/useScholarshipFilters'
import type { EducationLevel, AwardType, ScholarshipCategory } from '../types/scholarship'
import type { EligibilityStatus } from '../../eligibility/types/eligibility'

interface ScholarshipFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterState
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  onReset: () => void
  activeCount: number
  totalCount: number
  matchedCount: number
}

export function ScholarshipFilterDrawer({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  activeCount,
  matchedCount,
}: ScholarshipFilterDrawerProps) {
  const content = (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex items-center justify-between pb-3 border-b border-warm-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-forest-700" />
          <h3 className="text-sm font-bold text-forest-900">Filters</h3>
          {activeCount > 0 && (
            <span className="text-[11px] font-semibold bg-forest-900 text-white px-2 py-0.5 rounded-full">
              {activeCount} active
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-forest-800 hover:text-forest-900 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Saved Only Quick Toggle */}
      <div className="p-3 bg-forest-50/70 rounded-xl border border-emerald-200">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-semibold text-forest-900">
            Bookmarked Opportunities Only
          </span>
          <input
            type="checkbox"
            checked={filters.savedOnly}
            onChange={(e) => onFilterChange('savedOnly', e.target.checked)}
            className="w-4 h-4 rounded text-forest-800 focus:ring-forest-700 cursor-pointer"
          />
        </label>
      </div>

      {/* Eligibility Match Filter */}
      <div className="space-y-2">
        <label htmlFor="filter-eligibility" className="text-xs font-semibold text-warm-700 block">
          Eligibility Match
        </label>
        <select
          id="filter-eligibility"
          value={filters.eligibilityStatus}
          onChange={(e) =>
            onFilterChange('eligibilityStatus', e.target.value as 'all' | EligibilityStatus)
          }
          className="w-full rounded-xl bg-white border border-warm-300 px-3 py-2 text-xs text-warm-900 focus-visible:border-forest-700 focus-visible:outline-none"
        >
          <option value="all">All Eligibility Levels</option>
          <option value="strong_match">Strong Match (Meets Mandatory)</option>
          <option value="potential_match">Potential Match (Info Needed)</option>
          <option value="not_eligible">Not Eligible</option>
        </select>
      </div>

      {/* Country / Region Filter */}
      <div className="space-y-2">
        <label htmlFor="filter-country" className="text-xs font-semibold text-warm-700 block">
          Country of Residence / Region
        </label>
        <select
          id="filter-country"
          value={filters.country}
          onChange={(e) => onFilterChange('country', e.target.value)}
          className="w-full rounded-xl bg-white border border-warm-300 px-3 py-2 text-xs text-warm-900 focus-visible:border-forest-700 focus-visible:outline-none"
        >
          <option value="all">All Regions &amp; Global</option>
          <option value="Canada">Canada</option>
          <option value="Germany">Germany</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="United States">United States</option>
          <option value="India">India</option>
          <option value="Singapore">Singapore</option>
          <option value="Sweden">Sweden</option>
          <option value="GLOBAL">Global Only</option>
        </select>
      </div>

      {/* Education Level */}
      <div className="space-y-2">
        <label htmlFor="filter-education" className="text-xs font-semibold text-warm-700 block">
          Education Level
        </label>
        <select
          id="filter-education"
          value={filters.educationLevel}
          onChange={(e) =>
            onFilterChange('educationLevel', e.target.value as 'all' | EducationLevel)
          }
          className="w-full rounded-xl bg-white border border-warm-300 px-3 py-2 text-xs text-warm-900 focus-visible:border-forest-700 focus-visible:outline-none"
        >
          <option value="all">All Education Levels</option>
          <option value="undergraduate">Undergraduate (Bachelor's)</option>
          <option value="masters">Master's / Postgraduate</option>
          <option value="doctorate">Doctorate / Ph.D.</option>
          <option value="high_school">High School</option>
          <option value="vocational">Vocational</option>
        </select>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label htmlFor="filter-category" className="text-xs font-semibold text-warm-700 block">
          Scholarship Category
        </label>
        <select
          id="filter-category"
          value={filters.category}
          onChange={(e) =>
            onFilterChange('category', e.target.value as 'all' | ScholarshipCategory)
          }
          className="w-full rounded-xl bg-white border border-warm-300 px-3 py-2 text-xs text-warm-900 focus-visible:border-forest-700 focus-visible:outline-none"
        >
          <option value="all">All Categories</option>
          <option value="stem">STEM &amp; Computing</option>
          <option value="community">Civic Leadership &amp; Policy</option>
          <option value="first-gen">First-Generation Scholars</option>
          <option value="humanities">Humanities &amp; Social Sciences</option>
          <option value="healthcare">Healthcare &amp; Biomedical</option>
          <option value="merit">Academic Merit</option>
          <option value="need-based">Need-Based Assistance</option>
        </select>
      </div>

      {/* Currency */}
      <div className="space-y-2">
        <label htmlFor="filter-currency" className="text-xs font-semibold text-warm-700 block">
          Currency Denomination
        </label>
        <select
          id="filter-currency"
          value={filters.currency}
          onChange={(e) => onFilterChange('currency', e.target.value)}
          className="w-full rounded-xl bg-white border border-warm-300 px-3 py-2 text-xs text-warm-900 focus-visible:border-forest-700 focus-visible:outline-none"
        >
          <option value="all">All Currencies</option>
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="CAD">CAD (CA$)</option>
          <option value="SGD">SGD (SG$)</option>
          <option value="INR">INR (₹)</option>
        </select>
      </div>

      {/* Award Structure */}
      <div className="space-y-2">
        <label htmlFor="filter-award" className="text-xs font-semibold text-warm-700 block">
          Award Structure
        </label>
        <select
          id="filter-award"
          value={filters.awardType}
          onChange={(e) =>
            onFilterChange('awardType', e.target.value as 'all' | AwardType)
          }
          className="w-full rounded-xl bg-white border border-warm-300 px-3 py-2 text-xs text-warm-900 focus-visible:border-forest-700 focus-visible:outline-none"
        >
          <option value="all">All Award Types</option>
          <option value="annual">Annual Award</option>
          <option value="renewable">Multi-Year Renewable</option>
          <option value="one_time">One-time Grant</option>
        </select>
      </div>

      {/* Deadline Urgency */}
      <div className="space-y-2">
        <label htmlFor="filter-urgency" className="text-xs font-semibold text-warm-700 block">
          Deadline Timeline
        </label>
        <select
          id="filter-urgency"
          value={filters.urgency}
          onChange={(e) =>
            onFilterChange('urgency', e.target.value as FilterState['urgency'])
          }
          className="w-full rounded-xl bg-white border border-warm-300 px-3 py-2 text-xs text-warm-900 focus-visible:border-forest-700 focus-visible:outline-none"
        >
          <option value="all">All Deadlines</option>
          <option value="urgent">Urgent (&le; 7 days)</option>
          <option value="upcoming">Upcoming (&le; 21 days)</option>
          <option value="standard">Standard (&gt; 21 days)</option>
          <option value="expired">Concluded / Expired</option>
        </select>
      </div>

      {/* Summary caption */}
      <div className="pt-2 text-[11px] text-warm-500 text-center">
        Showing {matchedCount} matching scholarships
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar Panel */}
      <div className="hidden lg:block w-72 shrink-0">
        <div className="p-5 bg-white rounded-2xl border border-warm-300 shadow-sm sticky top-24">
          {content}
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-forest-950/60 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Scholarship Filters"
            className="relative w-80 max-w-[85vw] bg-white text-warm-900 p-6 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-warm-200 mb-6">
                <span className="font-bold text-base text-forest-900">Filter Directory</span>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-lg text-warm-500 hover:text-warm-900"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {content}
            </div>

            <div className="pt-6 mt-6 border-t border-warm-200">
              <Button variant="primary" size="md" onClick={onClose} className="w-full justify-center">
                View {matchedCount} Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
