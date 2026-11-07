import { Link } from 'react-router-dom'
import { Header } from '../../../components/shared/Header'
import { Footer } from '../../../components/shared/Footer'
import { DemoNotice } from '../../../components/shared/DemoNotice'
import { ProfileForm } from '../components/ProfileForm'
import { ArrowLeft, Compass, Sparkles } from 'lucide-react'

export function ProfilePage() {
  return (
    <div className="min-h-screen flex flex-col bg-warm-50 text-warm-900">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Navigation & Breadcrumbs */}
        <div className="flex items-center justify-between">
          <Link
            to="/scholarships"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-800 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Discovery Directory</span>
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-warm-600 hover:text-forest-900"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Dashboard Workspace</span>
          </Link>
        </div>

        {/* Demo Notice */}
        <DemoNotice />

        {/* Page Title & Intro */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-emerald-200 text-xs font-semibold text-forest-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Intelligent Eligibility Profile</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-forest-900">
            Student Profile &amp; Preferences
          </h1>
          <p className="text-sm text-warm-600 max-w-2xl leading-relaxed">
            Configure your academic level, country of residence, grading scale, and discipline. The deterministic matching engine continuously evaluates opportunities against these attributes to identify strong matches, potential matches, and required steps.
          </p>
        </div>

        {/* Profile Form */}
        <ProfileForm />
      </main>

      <Footer />
    </div>
  )
}
