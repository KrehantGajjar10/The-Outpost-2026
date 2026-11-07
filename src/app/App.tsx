import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { Providers } from './providers'
import { Button } from '../components/ui/Button'
import { CommandPalette } from '../components/shared/CommandPalette'
import { ArrowLeft, Home, Compass } from 'lucide-react'

const LandingPage = lazy(() =>
  import('../features/landing/pages/LandingPage').then((m) => ({ default: m.LandingPage })),
)
const DiscoveryPage = lazy(() =>
  import('../features/scholarships/pages/DiscoveryPage').then((m) => ({
    default: m.DiscoveryPage,
  })),
)
const ProfilePage = lazy(() =>
  import('../features/profile/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)
const DashboardPage = lazy(() =>
  import('../features/dashboard/pages/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  })),
)

function PageLoadingFallback() {
  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-6 text-center">
      <div className="space-y-3">
        <div className="w-10 h-10 rounded-xl bg-forest-900 text-emerald-400 flex items-center justify-center font-bold text-lg mx-auto animate-pulse font-serif">
          G
        </div>
        <p className="text-xs text-warm-600 font-medium">Loading workspace...</p>
      </div>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4 p-8 bg-white rounded-2xl border border-warm-300 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-forest-800 flex items-center justify-center mx-auto text-xl font-bold font-serif">
          G
        </div>
        <h1 className="text-2xl font-bold text-forest-900">Page Not Found</h1>
        <p className="text-sm text-warm-600">
          The scholarship portal page you are trying to visit does not exist or has moved.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link to="/">
            <Button variant="primary" size="sm" icon={<Home className="w-4 h-4" />}>
              Return Home
            </Button>
          </Link>
          <Link to="/scholarships">
            <Button variant="outline" size="sm" icon={<Compass className="w-4 h-4" />}>
              Find Scholarships
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Dashboard Demo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function AppShell() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      }
    }
    const handleOpenPalette = () => {
      setCommandPaletteOpen(true)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('grantly:open_command_palette', handleOpenPalette)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('grantly:open_command_palette', handleOpenPalette)
    }
  }, [])

  return (
    <>
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/scholarships" element={<DiscoveryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectScholarship={(id) => {
          setCommandPaletteOpen(false)
          navigate(`/scholarships?select=${id}`)
        }}
      />
    </>
  )
}

export default function App() {
  return (
    <Providers>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </Providers>
  )
}
