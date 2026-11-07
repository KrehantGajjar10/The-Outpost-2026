import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '../../../components/ui/Button'

export function CtaSection() {
  return (
    <section className="py-20 bg-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-forest-900 text-warm-100 border border-forest-700 p-8 sm:p-14 relative overflow-hidden shadow-xl">
          {/* Subtle background glow */}
          <div
            className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="max-w-2xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-forest-950/80 px-3 py-1 rounded-full border border-forest-700">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Interactive Application Sandbox</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Experience the unified scholarship platform firsthand.
            </h2>

            <p className="text-base sm:text-lg text-forest-200 leading-relaxed">
              Step into Elena Rostova's simulated dashboard to explore active pipeline tracking, deadline intelligence, requirement checklists, and financial calculations.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link to="/dashboard">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto font-semibold px-6 py-3.5 bg-emerald-50 text-forest-950 hover:bg-emerald-100 border-0"
                  icon={<ArrowRight className="w-5 h-5" />}
                  iconPosition="right"
                >
                  Enter Dashboard Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
