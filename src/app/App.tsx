import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { Providers } from './providers'
import { LandingPage } from '../features/landing/pages/LandingPage'
import { DashboardPage } from '../features/dashboard/pages/DashboardPage'
import { DiscoveryPage } from '../features/scholarships/pages/DiscoveryPage'
import { ProfilePage } from '../features/profile/pages/ProfilePage'
import { Button } from '../components/ui/Button'
import { ArrowLeft, Home, Compass } from 'lucide-react'

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

export default function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/scholarships" element={<DiscoveryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </Providers>
  )
}
