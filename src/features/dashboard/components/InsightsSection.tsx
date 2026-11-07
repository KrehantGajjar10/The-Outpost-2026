import { useMemo } from 'react'
import { Card } from '../../../components/ui/Card'
import { formatCurrency } from '../../../lib/utils'
import type { Scholarship } from '../../scholarships/types/scholarship'
import { PieChart, Layers } from 'lucide-react'

interface InsightsSectionProps {
  scholarships: Scholarship[]
}

export function InsightsSection({ scholarships }: InsightsSectionProps) {
  // Compute category funding breakdown for saved/in_progress scholarships
  const insights = useMemo(() => {
    const savedOrActive = scholarships.filter(
      (s) => s.status === 'saved' || s.status === 'in_progress',
    )
    const totalFunding = savedOrActive.reduce((acc, curr) => acc + curr.amount, 0)

    const categoryMap: Record<string, { label: string; amount: number; count: number }> = {}

    for (const sch of savedOrActive) {
      if (!categoryMap[sch.category]) {
        categoryMap[sch.category] = {
          label: sch.categoryLabel,
          amount: 0,
          count: 0,
        }
      }
      categoryMap[sch.category].amount += sch.amount
      categoryMap[sch.category].count += 1
    }

    const categoryList = Object.entries(categoryMap).map(([cat, val]) => ({
      category: cat,
      label: val.label,
      amount: val.amount,
      count: val.count,
      percentage: totalFunding > 0 ? Math.round((val.amount / totalFunding) * 100) : 0,
    }))

    // Stage breakdown
    const stageCounts = {
      saved: scholarships.filter((s) => s.status === 'saved').length,
      inProgress: scholarships.filter((s) => s.status === 'in_progress').length,
      submitted: scholarships.filter((s) => s.status === 'submitted').length,
    }

    return {
      totalFunding,
      categoryList,
      stageCounts,
    }
  }, [scholarships])

  return (
    <section id="insights" aria-label="Pipeline Funding Insights" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-lg font-bold tracking-tight text-forest-900">
            Pipeline Distribution & Funding Insights
          </h3>
          <p className="text-xs text-warm-600">
            Summary metrics computed from your current pipeline ({formatCurrency(insights.totalFunding)} total).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category Breakdown (2 columns) */}
        <Card variant="default" className="p-5 md:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-warm-100">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-forest-700" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-forest-900">
                Funding by Field & Category
              </h4>
            </div>
            <span className="text-xs font-bold text-forest-700">
              {formatCurrency(insights.totalFunding)} Total
            </span>
          </div>

          {/* Accessible visual bar */}
          <div
            role="progressbar"
            aria-label="Distribution of funding across categories"
            aria-valuenow={100}
            aria-valuemin={0}
            aria-valuemax={100}
            className="w-full h-3 rounded-full bg-warm-100 flex overflow-hidden"
          >
            {insights.categoryList.map((cat, idx) => {
              const bgColors = [
                'bg-[#124332]',
                'bg-[#059669]',
                'bg-[#10b981]',
                'bg-[#34d399]',
                'bg-[#6ee7b7]',
              ]
              return (
                <div
                  key={cat.category}
                  style={{ width: `${cat.percentage}%` }}
                  title={`${cat.label}: ${cat.percentage}%`}
                  className={`${bgColors[idx % bgColors.length]} h-full transition-all`}
                />
              )
            })}
          </div>

          {/* Accessible Table List */}
          <div className="divide-y divide-warm-100 text-xs">
            {insights.categoryList.map((cat) => (
              <div key={cat.category} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-forest-700" />
                  <span className="font-medium text-warm-900">{cat.label}</span>
                  <span className="text-[11px] text-warm-500">({cat.count} awards)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-forest-900">
                    {formatCurrency(cat.amount)}
                  </span>
                  <span className="w-10 text-right font-mono text-warm-500">
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Stage Status Breakdown */}
        <Card variant="default" className="p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-warm-100">
              <Layers className="w-4 h-4 text-forest-700" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-forest-900">
                Application Funnel
              </h4>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-warm-50 border border-warm-200 flex items-center justify-between">
                <span className="text-xs font-medium text-warm-600">Saved for Review</span>
                <span className="text-sm font-bold text-forest-900">
                  {insights.stageCounts.saved}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-forest-50 border border-emerald-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#065f46]">
                  Active Preparation (In Progress)
                </span>
                <span className="text-sm font-bold text-[#065f46]">
                  {insights.stageCounts.inProgress}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-warm-50 border border-warm-200 flex items-center justify-between">
                <span className="text-xs font-medium text-warm-500">
                  Submitted to Committee
                </span>
                <span className="text-sm font-bold text-warm-500">
                  {insights.stageCounts.submitted}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-warm-500 pt-3 border-t border-warm-100">
            Funnel counts update automatically as you save or review opportunities.
          </p>
        </Card>
      </div>
    </section>
  )
}
