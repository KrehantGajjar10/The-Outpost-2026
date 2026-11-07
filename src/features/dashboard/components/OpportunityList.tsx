import { Building2, Calendar, Award, Bookmark, ArrowUpRight, Search } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { Badge, UrgencyBadge, StatusBadge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { formatDisplayDate } from '../../../lib/utils'
import type { Scholarship, ScholarshipCategory } from '../../scholarships/types/scholarship'
import type { ScholarshipFilters } from '../types/dashboard'

interface OpportunityListProps {
  scholarships: Scholarship[]
  filters: ScholarshipFilters
  onSearchChange: (query: string) => void
  onCategoryChange: (category: 'all' | ScholarshipCategory) => void
  onSelectScholarship: (scholarship: Scholarship) => void
  onToggleSave: (id: string) => void
}

export function OpportunityList({
  scholarships,
  filters,
  onSearchChange,
  onCategoryChange,
  onSelectScholarship,
  onToggleSave,
}: OpportunityListProps) {
  const categories: { key: 'all' | ScholarshipCategory; label: string }[] = [
    { key: 'all', label: 'All Opportunities' },
    { key: 'stem', label: 'STEM & Computing' },
    { key: 'community', label: 'Civic & Policy' },
    { key: 'first-gen', label: 'First-Gen' },
    { key: 'merit', label: 'Academic Merit' },
    { key: 'need-based', label: 'Need-Based' },
  ]

  return (
    <div id="opportunities" className="space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-forest-900">
              Recommended Opportunities
            </h2>
            <Badge variant="demo" size="sm">
              Simulated Catalog
            </Badge>
          </div>
          <p className="text-xs text-warm-600">
            Showing {scholarships.length} scholarships matching your academic profile and active filters.
          </p>
        </div>

        {/* Search input */}
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search by title or provider..."
            value={filters.searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            clearable
            onClear={() => onSearchChange('')}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Category filter buttons */}
      <div
        aria-label="Filter opportunities by field"
        className="flex items-center gap-2 overflow-x-auto pb-2"
      >
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            aria-pressed={filters.category === cat.key}
            onClick={() => onCategoryChange(cat.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filters.category === cat.key
                ? 'bg-forest-900 text-white shadow-xs'
                : 'bg-white text-warm-600 hover:bg-warm-200 border border-warm-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Scholarships list */}
      {scholarships.length === 0 ? (
        <Card variant="subtle" className="p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-forest-900">
            No scholarships found matching your criteria.
          </p>
          <p className="text-xs text-warm-500">
            Try adjusting your search query or selecting "All Opportunities".
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onSearchChange('')
              onCategoryChange('all')
            }}
          >
            Reset Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scholarships.map((item) => {
            const isSaved = item.isSaved ?? false

            return (
              <Card
                key={item.id}
                variant="default"
                className="p-5 flex flex-col justify-between space-y-4 hover:border-forest-700/60 hover:shadow-sm transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-forest-700">
                          {item.categoryLabel}
                        </span>
                        <span className="text-warm-300">•</span>
                        <StatusBadge status={item.status ?? 'recommended'} />
                      </div>
                      <h3 className="text-base font-bold text-forest-900 line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-warm-500 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {item.provider}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleSave(item.id)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        isSaved
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          : 'bg-white border-warm-300 text-warm-400 hover:text-warm-700'
                      }`}
                      aria-label={isSaved ? 'Remove from saved' : 'Save scholarship'}
                      title={isSaved ? 'Saved in pipeline' : 'Save opportunity'}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600' : ''}`} />
                    </button>
                  </div>

                  <p className="text-xs text-warm-600 line-clamp-2 leading-relaxed">
                    {item.detailedDescription || item.shortDescription || item.description || ''}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-warm-500">
                    <span className="inline-flex items-center gap-1 bg-warm-50 px-2 py-0.5 rounded border border-warm-200">
                      <Award className="w-3 h-3 text-forest-700" />
                      Min GPA {item.minGpa !== undefined ? item.minGpa.toFixed(1) : (item.academicRequirement?.minScore ?? 'N/A')}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-warm-50 px-2 py-0.5 rounded border border-warm-200">
                      {item.isRenewable || item.awardType === 'renewable' ? 'Renewable' : 'One-time'}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-warm-50 px-2 py-0.5 rounded border border-warm-200">
                      {(item.requirements ?? item.requiredDocuments ?? []).length} Requirements
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-warm-100 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-base font-bold text-forest-900">
                      {(item.formattedAmount || item.amountFormatted || '').split(' ')[0]}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-warm-500">
                      <Calendar className="w-3 h-3" />
                      <span>Due {formatDisplayDate(item.deadline)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <UrgencyBadge urgency={item.urgency ?? 'normal'} daysRemaining={item.daysRemaining ?? 0} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectScholarship(item)}
                      icon={<ArrowUpRight className="w-3.5 h-3.5" />}
                      iconPosition="right"
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
