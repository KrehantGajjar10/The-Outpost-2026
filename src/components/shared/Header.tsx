import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, ArrowRight, Compass, ShieldCheck, User, Layers } from 'lucide-react'
import { Button } from '../ui/Button'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileMenuOpen])

  return (
    <header className="sticky top-0 z-40 bg-warm-50/95 backdrop-blur-md border-b border-warm-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 rounded-lg p-1"
          aria-label="GRANTLY Home"
        >
          <div className="w-10 h-10 rounded-xl bg-forest-900 text-emerald-400 flex items-center justify-center font-bold text-xl tracking-tight shadow-sm border border-forest-700/60 transition-transform group-hover:scale-105">
            <span className="font-serif">G</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xl tracking-tight text-forest-900">
                GRANTLY
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-forest-800 border border-emerald-200">
                Demo
              </span>
            </div>
            <p className="text-[11px] text-warm-600 font-medium hidden sm:block">
              Unified Scholarship Platform
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-7 text-sm font-medium text-warm-700"
          aria-label="Main Navigation"
        >
          <Link
            to="/scholarships"
            className="hover:text-forest-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 rounded px-1 flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4 text-forest-700" />
            <span>Discover</span>
          </Link>
          <Link
            to="/applications"
            className="hover:text-forest-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 rounded px-1 flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-forest-700" />
            <span>Applications</span>
          </Link>
          <Link
            to="/profile"
            className="hover:text-forest-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 rounded px-1 flex items-center gap-1.5"
          >
            <User className="w-4 h-4 text-forest-700" />
            <span>Student Profile</span>
          </Link>
          <a
            href="/#how-it-works"
            className="hover:text-forest-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 rounded px-1"
          >
            How It Works
          </a>
          <a
            href="/#benefits"
            className="hover:text-forest-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 rounded px-1"
          >
            Core Benefits
          </a>
        </nav>

        {/* Action Button & Demo Gateway */}
        <div className="hidden sm:flex items-center gap-3">
          <Link to="/scholarships">
            <Button variant="outline" size="md">
              Find Scholarships
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button
              variant="primary"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Dashboard Demo
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center sm:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-warm-700 hover:text-forest-900 hover:bg-warm-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 cursor-pointer"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="sm:hidden border-b border-warm-200 bg-warm-50 px-4 pt-3 pb-6 space-y-4 shadow-lg transition-all"
          role="dialog"
          aria-label="Mobile Navigation Menu"
        >
          <nav className="flex flex-col space-y-3 text-base font-medium text-warm-700">
            <Link
              to="/scholarships"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-warm-200 hover:text-forest-900 transition-colors flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-forest-700" />
              Discover Scholarships
            </Link>
            <Link
              to="/applications"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-warm-200 hover:text-forest-900 transition-colors flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-forest-700" />
              Application Workspace
            </Link>
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-warm-200 hover:text-forest-900 transition-colors flex items-center gap-2"
            >
              <User className="w-4 h-4 text-forest-700" />
              Student Profile &amp; Eligibility
            </Link>
            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-warm-200 hover:text-forest-900 transition-colors flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-forest-700" />
              How It Works
            </a>
            <a
              href="/#benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-warm-200 hover:text-forest-900 transition-colors flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-forest-700" />
              Core Benefits
            </a>
          </nav>
          <div className="pt-2 border-t border-warm-200 flex flex-col gap-2">
            <Link to="/scholarships" onClick={() => setMobileMenuOpen(false)} className="w-full block">
              <Button variant="outline" size="md" className="w-full justify-center">
                Search Scholarships
              </Button>
            </Link>
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full block">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Launch Dashboard Demo
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
