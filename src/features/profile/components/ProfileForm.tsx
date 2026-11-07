import React, { useState, useEffect } from 'react'
import type { StudentProfile, AcademicScoreScale } from '../types/profile'
import type { EducationLevel } from '../../scholarships/types/scholarship'
import { profileService } from '../services/profileService'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import {
  User,
  Globe,
  GraduationCap,
  Award,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react'

interface ProfileFormProps {
  onProfileUpdated?: (profile: StudentProfile) => void
}

export function ProfileForm({ onProfileUpdated }: ProfileFormProps) {
  const [profile, setProfile] = useState<StudentProfile>(() => profileService.getProfile())
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const handleProfileChange = (e: Event) => {
      const customEvent = e as CustomEvent<StudentProfile>
      if (customEvent.detail) {
        setProfile(customEvent.detail)
      }
    }
    window.addEventListener('grantly:profile_changed', handleProfileChange)
    return () => window.removeEventListener('grantly:profile_changed', handleProfileChange)
  }, [])

  const handleChange = (
    field: keyof StudentProfile,
    value: unknown,
  ) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
    setSavedSuccess(false)
  }

  const handleScoreChange = (value: number, scale: AcademicScoreScale) => {
    let label = `${value}`
    if (scale === 'gpa_4') label = `${value.toFixed(2)} / 4.0 GPA`
    else if (scale === 'gpa_5') label = `${value.toFixed(2)} / 5.0 GPA`
    else if (scale === 'percentage') label = `${Math.round(value)}%`

    setProfile((prev) => ({
      ...prev,
      academicScore: {
        value,
        scale,
        label,
      },
    }))
    setSavedSuccess(false)
  }

  const handleDestinationsChange = (destination: string) => {
    setProfile((prev) => {
      const current = prev.preferredStudyDestinations || []
      const exists = current.includes(destination)
      const updated = exists
        ? current.filter((d) => d !== destination)
        : [...current, destination]
      return { ...prev, preferredStudyDestinations: updated }
    })
    setSavedSuccess(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!profile.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name.'
    }
    if (!profile.countryOfResidence.trim()) {
      newErrors.countryOfResidence = 'Please specify your country of residence.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const ok = profileService.saveProfile(profile)
    if (ok) {
      setSavedSuccess(true)
      setSaveError(null)
      onProfileUpdated?.(profile)

      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
      }

      setTimeout(() => {
        setSavedSuccess(false)
      }, 3500)
    } else {
      setSavedSuccess(false)
      setSaveError(
        'Failed to save student profile. Please check browser storage quotas or permissions.',
      )
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
      }
    }
  }

  const handleReset = () => {
    if (window.confirm('Reset profile to default demonstration values?')) {
      const reset = profileService.resetProfile()
      setProfile(reset)
      setSavedSuccess(true)
      setSaveError(null)
      onProfileUpdated?.(reset)

      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
      }

      setTimeout(() => setSavedSuccess(false), 3000)
    }
  }

  const availableDestinations = [
    'Canada',
    'Germany',
    'United Kingdom',
    'United States',
    'Sweden',
    'Singapore',
    'Australia',
    'France',
    'India',
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Save Success Alert */}
      {savedSuccess && (
        <div
          role="status"
          className="p-4 rounded-xl bg-forest-50 border border-emerald-200 text-forest-900 flex items-center justify-between gap-3 text-sm transition-opacity"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="font-semibold">
              Profile saved successfully! Eligibility matching has been refreshed.
            </p>
          </div>
        </div>
      )}

      {/* Save Error Alert */}
      {saveError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-center justify-between gap-3 text-sm transition-opacity"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="font-semibold">{saveError}</p>
          </div>
        </div>
      )}

      {/* Basic Demographics */}
      <Card variant="default" className="p-6 space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-warm-200">
          <div className="w-9 h-9 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center border border-emerald-200">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-forest-900">Personal &amp; Contact Information</h3>
            <p className="text-xs text-warm-600">
              Basic identity information used for personalized greetings and matching records.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="text-xs font-semibold text-warm-700">
              Full Legal Name <span className="text-rose-600">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              value={profile.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className="w-full rounded-xl bg-white border border-warm-300 px-3.5 py-2 text-sm text-warm-900 focus-visible:border-forest-700 focus-visible:outline-none"
              placeholder="e.g. Elena Rostova"
            />
            {errors.fullName && <p className="text-xs text-rose-600">{errors.fullName}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="preferredName" className="text-xs font-semibold text-warm-700">
              Preferred First Name
            </label>
            <input
              id="preferredName"
              type="text"
              value={profile.preferredName}
              onChange={(e) => handleChange('preferredName', e.target.value)}
              className="w-full rounded-xl bg-white border border-warm-300 px-3.5 py-2 text-sm text-warm-900 focus-visible:border-forest-700 focus-visible:outline-none"
              placeholder="e.g. Elena"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="email" className="text-xs font-semibold text-warm-700">
              Email Address (Optional)
            </label>
            <input
              id="email"
              type="email"
              value={profile.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full rounded-xl bg-white border border-warm-300 px-3.5 py-2 text-sm text-warm-900 focus-visible:border-forest-700 focus-visible:outline-none"
              placeholder="e.g. applicant@university.edu"
            />
            <p className="text-[11px] text-warm-500">
              Stored locally on your device only. Never transmitted to third-party trackers.
            </p>
          </div>
        </div>
      </Card>

      {/* Geographic Origin & Destinations */}
      <Card variant="default" className="p-6 space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-warm-200">
          <div className="w-9 h-9 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center border border-emerald-200">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-forest-900">Geographic &amp; Nationality Profile</h3>
            <p className="text-xs text-warm-600">
              Powers geographic eligibility rules across international foundation criteria.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="countryOfResidence" className="text-xs font-semibold text-warm-700">
              Country of Residence <span className="text-rose-600">*</span>
            </label>
            <input
              id="countryOfResidence"
              type="text"
              value={profile.countryOfResidence}
              onChange={(e) => handleChange('countryOfResidence', e.target.value)}
              className="w-full rounded-xl bg-white border border-warm-300 px-3.5 py-2 text-sm text-warm-900 focus-visible:border-forest-700 focus-visible:outline-none"
              placeholder="e.g. Canada, Germany, India, United States"
            />
            {errors.countryOfResidence && (
              <p className="text-xs text-rose-600">{errors.countryOfResidence}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="nationality" className="text-xs font-semibold text-warm-700">
              Citizenship / Nationality
            </label>
            <input
              id="nationality"
              type="text"
              value={profile.nationality}
              onChange={(e) => handleChange('nationality', e.target.value)}
              className="w-full rounded-xl bg-white border border-warm-300 px-3.5 py-2 text-sm text-warm-900 focus-visible:border-forest-700 focus-visible:outline-none"
              placeholder="e.g. Canadian, German, Indian, American"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="stateOrProvince" className="text-xs font-semibold text-warm-700">
              State / Province / Region (Optional)
            </label>
            <input
              id="stateOrProvince"
              type="text"
              value={profile.stateOrProvince || ''}
              onChange={(e) => handleChange('stateOrProvince', e.target.value)}
              className="w-full rounded-xl bg-white border border-warm-300 px-3.5 py-2 text-sm text-warm-900 focus-visible:border-forest-700 focus-visible:outline-none"
              placeholder="e.g. British Columbia, Bavaria, Maharashtra, California"
            />
          </div>

          {/* Preferred Study Destinations */}
          <div className="space-y-2 sm:col-span-2 pt-2">
            <label className="text-xs font-semibold text-warm-700 block">
              Preferred Study Destinations (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {availableDestinations.map((dest) => {
                const selected = (profile.preferredStudyDestinations || []).includes(dest)
                return (
                  <button
                    key={dest}
                    type="button"
                    onClick={() => handleDestinationsChange(dest)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer border ${
                      selected
                        ? 'bg-forest-900 text-white border-forest-900 shadow-xs'
                        : 'bg-white text-warm-700 border-warm-300 hover:bg-warm-100'
                    }`}
                  >
                    {dest} {selected && '✓'}
                  </button>
                )
              })}
            </div>
            <p className="text-[11px] text-warm-500">
              Used to match destination-specific grants and international exchange bursaries.
            </p>
          </div>
        </div>
      </Card>

      {/* Academic Level & Discipline */}
      <Card variant="default" className="p-6 space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-warm-200">
          <div className="w-9 h-9 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center border border-emerald-200">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-forest-900">Academic Standing &amp; Discipline</h3>
            <p className="text-xs text-warm-600">
              Ensures you are matched only with opportunities targeting your qualification tier.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="educationLevel" className="text-xs font-semibold text-warm-700">
              Education Level <span className="text-rose-600">*</span>
            </label>
            <select
              id="educationLevel"
              value={profile.educationLevel}
              onChange={(e) => handleChange('educationLevel', e.target.value as EducationLevel)}
              className="w-full rounded-xl bg-white border border-warm-300 px-3.5 py-2 text-sm text-warm-900 focus-visible:border-forest-700 focus-visible:outline-none"
            >
              <option value="high_school">High School / Secondary</option>
              <option value="undergraduate">Undergraduate (Bachelor's)</option>
              <option value="masters">Master's / Postgraduate</option>
              <option value="doctorate">Doctorate / Ph.D.</option>
              <option value="vocational">Vocational / Technical</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="academicYear" className="text-xs font-semibold text-warm-700">
              Current Academic Year / Stage
            </label>
            <input
              id="academicYear"
              type="text"
              value={profile.academicYear || ''}
              onChange={(e) => handleChange('academicYear', e.target.value)}
              className="w-full rounded-xl bg-white border border-warm-300 px-3.5 py-2 text-sm text-warm-900 focus-visible:border-forest-700 focus-visible:outline-none"
              placeholder="e.g. Year 3 (Junior), Final Year"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="currentInstitution" className="text-xs font-semibold text-warm-700">
              Current Institution
            </label>
            <input
              id="currentInstitution"
              type="text"
              value={profile.currentInstitution}
              onChange={(e) => handleChange('currentInstitution', e.target.value)}
              className="w-full rounded-xl bg-white border border-warm-300 px-3.5 py-2 text-sm text-warm-900 focus-visible:border-forest-700 focus-visible:outline-none"
              placeholder="e.g. Pacific Coast University"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="fieldOfStudy" className="text-xs font-semibold text-warm-700">
              Primary Field of Study / Major <span className="text-rose-600">*</span>
            </label>
            <input
              id="fieldOfStudy"
              type="text"
              value={profile.fieldOfStudy}
              onChange={(e) => handleChange('fieldOfStudy', e.target.value)}
              className="w-full rounded-xl bg-white border border-warm-300 px-3.5 py-2 text-sm text-warm-900 focus-visible:border-forest-700 focus-visible:outline-none"
              placeholder="e.g. Computer Science & Public Policy, Biomedical Engineering"
            />
          </div>
        </div>
      </Card>

      {/* Academic Scoring & Grading Scales */}
      <Card variant="default" className="p-6 space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-warm-200">
          <div className="w-9 h-9 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center border border-emerald-200">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-forest-900">Academic Score &amp; Grading System</h3>
            <p className="text-xs text-warm-600">
              Supports international grading systems without forcing universal conversion.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="scoreScale" className="text-xs font-semibold text-warm-700">
              Grading Scale System
            </label>
            <select
              id="scoreScale"
              value={profile.academicScore.scale}
              onChange={(e) =>
                handleScoreChange(
                  profile.academicScore.value,
                  e.target.value as AcademicScoreScale,
                )
              }
              className="w-full rounded-xl bg-white border border-warm-300 px-3.5 py-2 text-sm text-warm-900 focus-visible:border-forest-700 focus-visible:outline-none"
            >
              <option value="gpa_4">GPA 4.0 Scale (e.g. 3.84)</option>
              <option value="percentage">Percentage 100% Scale (e.g. 88%)</option>
              <option value="gpa_5">GPA 5.0 Scale (e.g. 4.60)</option>
              <option value="none">Ungraded / Non-Numerical</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="scoreValue" className="text-xs font-semibold text-warm-700">
              Numerical Score / Grade
            </label>
            <input
              id="scoreValue"
              type="number"
              step="0.01"
              value={profile.academicScore.value || ''}
              onChange={(e) =>
                handleScoreChange(
                  parseFloat(e.target.value) || 0,
                  profile.academicScore.scale,
                )
              }
              className="w-full rounded-xl bg-white border border-warm-300 px-3.5 py-2 text-sm text-warm-900 focus-visible:border-forest-700 focus-visible:outline-none"
              placeholder="e.g. 3.84 or 88"
            />
          </div>

          <div className="sm:col-span-2 p-3 bg-warm-50 rounded-xl border border-warm-200 flex items-start gap-2.5 text-xs text-warm-600">
            <Info className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
            <p>
              Current display value: <strong className="text-forest-900">{profile.academicScore.label || profile.academicScore.value}</strong>. The eligibility engine evaluates this against each scholarship's academic minimum cutoff.
            </p>
          </div>
        </div>
      </Card>

      {/* Financial & Equity Indicators */}
      <Card variant="default" className="p-6 space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-warm-200">
          <div className="w-9 h-9 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center border border-emerald-200">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-forest-900">Financial Need &amp; Equity Considerations</h3>
            <p className="text-xs text-warm-600">
              Optional flags that unlock need-based grants and first-generation specific endowments.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-warm-200 hover:bg-warm-50 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={profile.financialNeed}
              onChange={(e) => handleChange('financialNeed', e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-forest-800 focus:ring-forest-700"
            />
            <div>
              <p className="text-sm font-semibold text-forest-900">
                Demonstrated Financial Need Eligible
              </p>
              <p className="text-xs text-warm-600 leading-relaxed">
                Check this if your household qualifies for income-tested financial aid, bursaries, or low-income grant programs.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-warm-200 hover:bg-warm-50 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={profile.firstGeneration}
              onChange={(e) => handleChange('firstGeneration', e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-forest-800 focus:ring-forest-700"
            />
            <div>
              <p className="text-sm font-semibold text-forest-900">
                First-Generation College Student
              </p>
              <p className="text-xs text-warm-600 leading-relaxed">
                Check this if neither of your parents or guardians completed a four-year bachelor’s degree.
              </p>
            </div>
          </label>
        </div>
      </Card>

      {/* Form Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-warm-200">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={handleReset}
          icon={<RotateCcw className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          Reset to Demo Profile
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          icon={<Sparkles className="w-4 h-4" />}
          iconPosition="right"
          className="w-full sm:w-auto"
        >
          Save Profile &amp; Update Matching
        </Button>
      </div>
    </form>
  )
}
