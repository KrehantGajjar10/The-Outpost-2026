import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Search, Compass, User, LayoutDashboard, Bookmark, ArrowRight } from 'lucide-react'
import { DEMO_SCHOLARSHIPS } from '../../features/scholarships/data/mockScholarships'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onSelectScholarship?: (id: string) => void
}

export function CommandPalette({ isOpen, onClose, onSelectScholarship }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Handle escape inside palette
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleClose = () => {
    setQuery('')
    onClose()
  }

  const filteredScholarships = DEMO_SCHOLARSHIPS.filter((s) => {
    if (!query.trim()) return false
    const q = query.toLowerCase()
    return (
      s.title.toLowerCase().includes(q) ||
      s.provider.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q))
    )
  }).slice(0, 5)

  const quickNav = [
    {
      title: 'Find Scholarships Directory',
      path: '/scholarships',
      icon: <Compass className="w-4 h-4 text-forest-700" />,
      desc: 'Browse international opportunities and filter by eligibility',
    },
    {
      title: 'Bookmarked Opportunities',
      path: '/scholarships?saved=true',
      icon: <Bookmark className="w-4 h-4 text-forest-700" />,
      desc: 'View saved scholarships pipeline',
    },
    {
      title: 'Student Profile & Eligibility Criteria',
      path: '/profile',
      icon: <User className="w-4 h-4 text-forest-700" />,
      desc: 'Manage your country, GPA, and study preferences',
    },
    {
      title: 'Applicant Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-4 h-4 text-forest-700" />,
      desc: 'Deadlines schedule, overview metrics, and progress tracking',
    },
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.15 }}
          className="fixed inset-0 bg-forest-950/60 backdrop-blur-xs"
          onClick={handleClose}
          aria-hidden="true"
        />

        {/* Dialog Box */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Command Palette Quick Search"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -10 }}
          className="relative w-full max-w-xl bg-white rounded-2xl border border-warm-300 shadow-2xl z-10 overflow-hidden"
        >
          {/* Search Input Bar */}
          <div className="p-3.5 border-b border-warm-200 flex items-center gap-3 bg-warm-50">
            <Search className="w-5 h-5 text-warm-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search scholarships, pages, or routes... (Type to filter)"
              className="w-full bg-transparent text-sm text-warm-900 placeholder:text-warm-400 focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-xs text-warm-400 hover:text-warm-700 cursor-pointer"
              >
                Clear
              </button>
            ) : (
              <kbd className="text-[10px] font-mono font-medium px-2 py-0.5 bg-white rounded border border-warm-300 text-warm-500">
                ESC
              </kbd>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto p-3 space-y-4">
            {/* Scholarship Matches */}
            {query.trim() && (
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-wider text-warm-500 px-2 pb-1">
                  Matching Scholarships
                </p>
                {filteredScholarships.length === 0 ? (
                  <p className="text-xs text-warm-500 px-3 py-2 italic">
                    No scholarships matching "{query}"
                  </p>
                ) : (
                  filteredScholarships.map((sch) => (
                    <button
                      key={sch.id}
                      type="button"
                      onClick={() => {
                        handleClose()
                        if (onSelectScholarship) {
                          onSelectScholarship(sch.id)
                        } else {
                          navigate(`/scholarships?select=${sch.id}`)
                        }
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-forest-50/70 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-forest-900 group-hover:text-forest-700 line-clamp-1">
                          {sch.title}
                        </p>
                        <p className="text-[11px] text-warm-500">
                          {sch.provider} • {sch.formattedAmount.split(' ')[0]} ({sch.currency})
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-warm-400 group-hover:text-forest-700 shrink-0" />
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Quick Navigation Pages */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold tracking-wider text-warm-500 px-2 pb-1">
                Quick Navigation
              </p>
              {quickNav.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    handleClose()
                    navigate(item.path)
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-warm-100 transition-colors flex items-center gap-3 cursor-pointer group"
                >
                  <div className="p-2 rounded-lg bg-warm-50 border border-warm-200 group-hover:bg-white transition-colors">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-warm-900 group-hover:text-forest-900">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-warm-500 line-clamp-1">{item.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-warm-400 group-hover:text-forest-700 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Footer tip */}
          <div className="px-4 py-2.5 bg-warm-50 border-t border-warm-200 flex items-center justify-between text-[11px] text-warm-500">
            <span>
              Tip: Press <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-warm-300">/</kbd> to search directory
            </span>
            <span>GRANTLY Quick Navigation</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
