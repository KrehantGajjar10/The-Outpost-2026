import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Building2, Calendar, Award } from 'lucide-react'
import { INITIAL_DEMO_SCHOLARSHIPS } from '../../dashboard/data/mockScholarships'
import { Card } from '../../../components/ui/Card'
import { UrgencyBadge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { formatDisplayDate } from '../../../lib/utils'
import type { ScholarshipCategory } from '../../scholarships/types/scholarship'

export function SamplePreviewSection() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | ScholarshipCategory>('all')

  const categories: { key: 'all' | ScholarshipCategory; label: string }[] = [
    { key: 'all', label: 'All Fields' },
    { key: 'stem', label: 'STEM & Tech' },
    { key: 'community', label: 'Civic & Policy' },
    { key: 'first-gen', label: 'First-Gen' },
    { key: 'merit', label: 'Academic Merit' },
  ]

  const filteredPreview = INITIAL_DEMO_SCHOLARSHIPS.filter((s) => {
    if (selectedCategory === 'all') return true
    return s.category === selectedCategory
  }).slice(0, 4)

  return (
    <section id="catalog" className="py-20 bg-white border-b border-warm-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                Curated Opportunities
              </span>
              <span className="text-xs text-warm-500 font-medium font-mono">
                Sample Dataset
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-forest-900">
              Explore realistic scholarship records.
            </h2>
            <p className="text-base text-warm-600">
              Every scholarship record features verified award values, clear renewal conditions, and structured requirement checklists.
            </p>
          </div>

          <Link to="/dashboard">
            <Button
              variant="secondary"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              View Full Pipeline in Dashboard
            </Button>
          </Link>
        </div>

        {/* Category Filter Chips */}
        <div
          role="tablist"
          aria-label="Filter sample scholarships by field"
          className="flex flex-wrap items-center gap-2"
        >
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-forest-900 text-white shadow-sm'
                  : 'bg-warm-50 text-warm-600 hover:bg-warm-200 border border-warm-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Scholarship Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPreview.map((item) => (
            <Card
              key={item.id}
              variant="default"
              interactive
              className="p-6 flex flex-col justify-between space-y-4 hover:border-forest-700/50 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-forest-700">
                        {item.categoryLabel}
                      </span>
                      <span className="text-warm-300">•</span>
                      <span className="text-xs text-warm-500">{item.organizationType}</span>
                    </div>
                    <h3 className="text-lg font-bold text-forest-900 group-hover:text-forest-700 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-bold text-forest-900">
                      {item.amountFormatted.split(' ')[0]}
                    </span>
                    <p className="text-[10px] text-warm-500 font-medium">
                      {item.isRenewable ? 'Renewable' : 'One-time'}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-warm-600 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-warm-500">
                  <span className="inline-flex items-center gap-1 bg-warm-50 px-2.5 py-1 rounded-md border border-warm-200">
                    <Building2 className="w-3.5 h-3.5 text-warm-600" />
                    {item.provider}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-warm-50 px-2.5 py-1 rounded-md border border-warm-200">
                    <Award className="w-3.5 h-3.5 text-warm-600" />
                    Min GPA {item.minGpa.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-warm-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs text-warm-600">
                  <Calendar className="w-3.5 h-3.5 text-warm-500" />
                  <span>Due {formatDisplayDate(item.deadline)}</span>
                </div>
                <UrgencyBadge urgency={item.urgency} daysRemaining={item.daysRemaining} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
