import { Link } from 'react-router-dom'
import { ShieldCheck, ArrowUpRight } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-forest-950 text-warm-100 border-t border-forest-800 pt-14 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-forest-800">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-forest-900 text-emerald-400 flex items-center justify-center font-bold text-lg border border-forest-700">
                <span className="font-serif">G</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-white">GRANTLY</span>
            </div>
            <p className="text-sm text-warm-400 max-w-md leading-relaxed">
              A unified platform helping students discover, understand, organize, and track educational financial aid opportunities without scattered spreadsheets or missed deadlines.
            </p>
            <div className="flex items-center gap-2 text-xs text-forest-300 bg-forest-900 px-3 py-1.5 rounded-lg border border-forest-700/50 w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Prototype Release • Simulated Demonstration Environment</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h3 className="text-xs font-semibold text-forest-300 uppercase tracking-wider mb-4">
              Platform Journey
            </h3>
            <ul className="space-y-2.5 text-sm text-warm-400">
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#benefits" className="hover:text-white transition-colors">
                  Core Benefits
                </a>
              </li>
              <li>
                <a href="#catalog" className="hover:text-white transition-colors">
                  Sample Opportunities
                </a>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
                  Applicant Dashboard Demo
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Student Commitment */}
          <div>
            <h3 className="text-xs font-semibold text-forest-300 uppercase tracking-wider mb-4">
              Core Principles
            </h3>
            <ul className="space-y-2 text-xs text-warm-400 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Transparent eligibility without hidden prerequisites</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Proactive deadline timelines with multi-modal urgency indicators</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Unified tracking of all letters, transcripts, and essay prompts</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-warm-500">
          <p>© {new Date().getFullYear()} GRANTLY Educational Platform. Built for prototype demonstration.</p>
          <p className="text-center sm:text-right">
            Demonstration data only. No real financial or student data is stored.
          </p>
        </div>
      </div>
    </footer>
  )
}
