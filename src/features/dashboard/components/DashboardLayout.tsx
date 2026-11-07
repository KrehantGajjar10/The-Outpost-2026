import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Compass,
  Calendar,
  BarChart3,
  Bell,
  Menu,
  X,
  ArrowLeft,
  User,
  Search,
  Layers,
} from 'lucide-react'
import { profileService, PROFILE_CHANGED_EVENT } from '../../profile/services/profileService'
import type { StudentProfile } from '../../profile/types/profile'
import { NotificationPanel } from './NotificationPanel'
import type { DashboardNotification } from '../types/dashboard'

interface DashboardLayoutProps {
  children: React.ReactNode
  notifications: DashboardNotification[]
  unreadCount: number
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onSelectScholarshipById?: (id: string) => void
  activeSection: string
  onSectionChange: (section: string) => void
  profile?: StudentProfile
}

export function DashboardLayout({
  children,
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onSelectScholarshipById,
  activeSection,
  onSectionChange,
  profile: propProfile,
}: DashboardLayoutProps) {
  const [internalProfile, setInternalProfile] = useState<StudentProfile>(() => profileService.getProfile())
  const profile = propProfile || internalProfile
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  useEffect(() => {
    const handleProfileChange = (e: Event) => {
      const customEvent = e as CustomEvent<StudentProfile>
      if (customEvent.detail) {
        setInternalProfile(customEvent.detail)
      }
    }
    window.addEventListener(PROFILE_CHANGED_EVENT, handleProfileChange)
    return () => window.removeEventListener(PROFILE_CHANGED_EVENT, handleProfileChange)
  }, [])

  const initials = (profile.fullName || 'Student')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'ST'

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileDrawerOpen) {
        setMobileDrawerOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileDrawerOpen])

  const navigationItems = [
    {
      id: 'overview',
      label: 'Pipeline Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
      hash: '',
    },
    {
      id: 'opportunities',
      label: 'Opportunities',
      icon: <Compass className="w-4 h-4" />,
      hash: '#opportunities',
    },
    {
      id: 'deadlines',
      label: 'Deadlines Schedule',
      icon: <Calendar className="w-4 h-4" />,
      hash: '#deadlines',
    },
    {
      id: 'insights',
      label: 'Funding Insights',
      icon: <BarChart3 className="w-4 h-4" />,
      hash: '#insights',
    },
  ]

  const handleNavClick = (id: string, hash: string) => {
    onSectionChange(id)
    setMobileDrawerOpen(false)
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col md:flex-row text-warm-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col justify-between bg-forest-900 text-warm-100 border-r border-forest-800 shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 space-y-8">
          {/* Brand header */}
          <Link
            to="/"
            className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg"
          >
            <div aria-hidden="true" className="w-10 h-10 rounded-xl bg-forest-800 text-emerald-400 flex items-center justify-center font-bold text-xl border border-forest-700">
              <span className="font-serif">G</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white">GRANTLY</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-forest-800 text-emerald-400 border border-forest-700">
                  Demo
                </span>
              </div>
              <p className="text-[11px] text-forest-200">Scholarship Platform</p>
            </div>
          </Link>

          {/* Working Navigation */}
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-wider text-forest-300 px-3 pb-2">
              Workspace
            </p>
            <nav className="space-y-1" aria-label="Sidebar Navigation">
              {navigationItems.map((item) => {
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id, item.hash)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-forest-800 text-white border border-forest-700'
                        : 'text-forest-200 hover:bg-forest-950 hover:text-white'
                    }`}
                  >
                    <span className={isActive ? 'text-emerald-400' : 'text-forest-300'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Discovery & Profile Links */}
          <div className="pt-4 border-t border-forest-800 space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-wider text-forest-300 px-3 pb-2">
              Platform
            </p>
            <Link
              to="/scholarships"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-forest-200 hover:bg-forest-950 hover:text-white transition-colors"
            >
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Find Scholarships</span>
            </Link>
            <Link
              to="/applications"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-forest-200 hover:bg-forest-950 hover:text-white transition-colors"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Applications Workspace</span>
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-forest-200 hover:bg-forest-950 hover:text-white transition-colors"
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span>Student Profile</span>
            </Link>
          </div>

          {/* Quick exit to Landing page */}
          <div className="pt-4 border-t border-forest-800">
            <Link
              to="/"
              className="flex items-center gap-2 text-xs text-forest-200 hover:text-white px-3.5 py-2 rounded-xl hover:bg-forest-950 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Landing Page</span>
            </Link>
          </div>
        </div>

        {/* Fictional Profile Card in Sidebar */}
        <Link
          to="/profile"
          className="p-4 m-4 rounded-xl bg-forest-950 border border-forest-700/70 space-y-2 hover:border-emerald-400 transition-colors block group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-forest-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate group-hover:text-emerald-300">
                {profile.fullName}
              </p>
              <p className="text-[10px] text-forest-200 truncate">
                {profile.academicScore?.label || `${profile.academicScore?.value} (${profile.academicScore?.scale})`} • {profile.academicYear || profile.educationLevel}
              </p>
            </div>
          </div>
          <div className="pt-1.5 border-t border-forest-800 flex items-center justify-between text-[10px] text-forest-300">
            <span className="truncate max-w-30">{profile.currentInstitution}</span>
            <span className="font-mono text-emerald-400">Edit Profile →</span>
          </div>
        </Link>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-warm-50/95 backdrop-blur-md border-b border-warm-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Mobile hamburger & brand */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="p-2 rounded-xl text-warm-700 hover:bg-warm-200 cursor-pointer"
              aria-label="Open mobile navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div aria-hidden="true" className="w-8 h-8 rounded-lg bg-forest-900 text-emerald-400 flex items-center justify-center font-bold text-sm">
                G
              </div>
              <span className="font-bold text-base text-forest-900">GRANTLY</span>
            </Link>
          </div>

          {/* Desktop Section Header Title */}
          <div className="hidden md:block">
            <h2 className="text-sm font-bold text-forest-900">
              Scholarship Discovery & Application Workspace
            </h2>
            <p className="text-[11px] text-warm-600">
              Pacific Coast University Student Financial Aid Portal
            </p>
          </div>

          {/* Right actions: Notifications & User profile avatar */}
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl text-warm-700 hover:bg-warm-200 hover:text-forest-900 relative cursor-pointer focus-visible:ring-2 focus-visible:ring-forest-700"
                aria-label={`Notifications: ${unreadCount} unread`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#e11d48] ring-2 ring-white" />
                )}
              </button>

              <NotificationPanel
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkRead={onMarkRead}
                onMarkAllRead={onMarkAllRead}
                onSelectScholarship={onSelectScholarshipById}
              />
            </div>

            {/* Profile Avatar Trigger */}
            <Link
              to="/profile"
              className="flex items-center gap-2 pl-2 border-l border-warm-200 hover:opacity-85 transition-opacity cursor-pointer"
              title="View & Edit Student Profile"
            >
              <div className="w-8 h-8 rounded-xl bg-forest-900 text-emerald-400 flex items-center justify-center font-bold text-xs shadow-xs">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-forest-900 leading-none">
                  {profile.preferredName || profile.fullName.split(' ')[0]}
                </p>
                <p className="text-[10px] text-warm-500 leading-none mt-1">
                  Active Profile
                </p>
              </div>
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-forest-950/50 backdrop-blur-xs"
              onClick={() => setMobileDrawerOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Navigation Drawer"
              className="relative w-72 max-w-[80vw] bg-forest-900 text-warm-100 p-5 flex flex-col justify-between shadow-2xl z-10"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-forest-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-forest-800 text-emerald-400 flex items-center justify-center font-bold text-sm">
                      G
                    </div>
                    <span className="font-bold text-base text-white">GRANTLY</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1 rounded-lg text-forest-200 hover:text-white"
                    aria-label="Close navigation"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navigationItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id, item.hash)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-forest-200 hover:bg-forest-800 hover:text-white transition-colors text-left"
                    >
                      <span className="text-emerald-400">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                  <div className="pt-2 border-t border-forest-800 my-2 space-y-1">
                    <Link
                      to="/scholarships"
                      onClick={() => setMobileDrawerOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-forest-200 hover:bg-forest-800 hover:text-white transition-colors"
                    >
                      <Search className="w-4 h-4 text-emerald-400" />
                      <span>Find Scholarships</span>
                    </Link>
                    <Link
                      to="/applications"
                      onClick={() => setMobileDrawerOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-forest-200 hover:bg-forest-800 hover:text-white transition-colors"
                    >
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <span>Applications Workspace</span>
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setMobileDrawerOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-forest-200 hover:bg-forest-800 hover:text-white transition-colors"
                    >
                      <User className="w-4 h-4 text-emerald-400" />
                      <span>Student Profile</span>
                    </Link>
                  </div>
                </nav>

                <div className="pt-4 border-t border-forest-800">
                  <Link
                    to="/"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="flex items-center gap-2 text-xs text-forest-200 hover:text-white px-3 py-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Landing Page</span>
                  </Link>
                </div>
              </div>

              {/* Mobile Student Profile Badge */}
              <div className="p-3 rounded-xl bg-forest-950 border border-forest-700">
                <p className="text-xs font-bold text-white">{profile.fullName}</p>
                <p className="text-[10px] text-forest-200 mt-0.5">
                  {profile.currentInstitution} • {profile.academicScore?.label || profile.academicScore?.value}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
