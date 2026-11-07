import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Sparkles, CheckCircle2, Clock, ShieldCheck, DollarSign } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { useReducedMotion } from '../../../hooks/useReducedMotion'

export function HeroSection() {
  const reducedMotion = useReducedMotion()

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Subtle background ambient gradients */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-linear-to-b from-forest-50/70 to-transparent pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline and Call-to-actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Demo announcement pill */}
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-forest-800"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Unified Scholarship Discovery & Management Platform</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={reducedMotion ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-forest-900 leading-[1.12]"
            >
              Scholarships shouldn't feel like a{' '}
              <span className="text-forest-700 underline decoration-emerald-400 decoration-wavy decoration-2">
                full-time puzzle.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={reducedMotion ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-lg sm:text-xl text-warm-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              Replace messy spreadsheets, missed deadlines, and confusing eligibility legalese with an organized, transparent student workspace built for clarity.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link to="/scholarships" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto text-base px-6 py-3.5 shadow-md shadow-forest-900/10"
                  icon={<ArrowRight className="w-5 h-5" />}
                  iconPosition="right"
                >
                  Find Scholarships
                </Button>
              </Link>
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                  Dashboard Demo
                </Button>
              </Link>
            </motion.div>

            {/* Value Checkpoints */}
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-warm-600"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero deceptive advertisements</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Multi-modal deadline alerts</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Structured eligibility criteria</span>
              </span>
            </motion.div>
          </div>

          {/* Right Column: Realistic Product Preview Widget */}
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="bg-white rounded-2xl border border-warm-300 shadow-xl p-5 sm:p-6 space-y-5 relative">
              {/* Product Preview Topbar */}
              <div className="flex items-center justify-between pb-4 border-b border-warm-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-forest-900 text-emerald-400 flex items-center justify-center text-sm font-bold">
                    G
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-forest-900">Elena Rostova's Workspace</p>
                    <p className="text-[10px] text-warm-500">Pacific Coast University • CS & Policy</p>
                  </div>
                </div>
                <Badge variant="demo" size="sm">
                  Interactive Preview
                </Badge>
              </div>

              {/* Mini Metrics Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-warm-50 border border-warm-200">
                  <p className="text-[11px] font-medium text-warm-500 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-forest-700" />
                    Potential Pipeline
                  </p>
                  <p className="text-lg font-bold text-forest-900 mt-0.5">$30,000</p>
                  <p className="text-[10px] text-forest-800 font-semibold">3 active applications</p>
                </div>
                <div className="p-3 rounded-xl bg-warm-50 border border-warm-200">
                  <p className="text-[11px] font-medium text-warm-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-accent" />
                    Nearest Deadline
                  </p>
                  <p className="text-lg font-bold text-[#be123c] mt-0.5">Nov 14, 2026</p>
                  <p className="text-[10px] text-[#be123c] font-medium font-mono">7 days remaining</p>
                </div>
              </div>

              {/* Active Pipeline Preview Card */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-forest-50/50 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold tracking-wide text-forest-800 uppercase">
                      Next Submission Priority
                    </span>
                    <p className="text-xs font-bold text-forest-950 mt-0.5 line-clamp-1">
                      Horizon Women in STEM Leadership Grant
                    </p>
                  </div>
                  <span className="text-xs font-bold text-forest-900 px-2 py-0.5 bg-white rounded border border-emerald-200 shrink-0">
                    $10,000
                  </span>
                </div>

                {/* Progress bar and milestone */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-warm-600">
                    <span>Requirements Ready</span>
                    <span className="font-semibold text-forest-800">3 of 4 items complete</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-emerald-100 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full w-3/4" />
                  </div>
                </div>

                <div className="text-[11px] text-warm-700 bg-white/80 p-2 rounded-lg border border-emerald-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-accent" />
                    <span>Upload GitHub Portfolio</span>
                  </span>
                  <span className="text-[10px] text-warm-500 font-medium">Due Nov 14</span>
                </div>
              </div>

              {/* Bottom live indicator */}
              <div className="pt-1 flex items-center justify-between text-[11px] text-warm-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Sample Scholarship Data
                </span>
                <Link
                  to="/dashboard"
                  className="font-semibold text-forest-800 hover:underline flex items-center gap-1"
                >
                  Enter full demo →
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
