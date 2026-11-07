import { Modal } from '../../../components/ui/Modal'
import { UrgencyBadge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { EligibilityBreakdownCard } from '../../eligibility/components/EligibilityBreakdownCard'
import { formatDisplayDate, calculateDaysRemaining, getUrgencyLevel } from '../../../lib/utils'
import type { Scholarship } from '../types/scholarship'
import type { EligibilityAssessment } from '../../eligibility/types/eligibility'
import {
  Calendar,
  Award,
  FileText,
  DollarSign,
  Bookmark,
  ShieldCheck,
  GraduationCap,
  Globe,
  Building2,
  CheckCircle2,
} from 'lucide-react'

interface ScholarshipDetailsViewProps {
  scholarship: Scholarship | null
  assessment?: EligibilityAssessment
  isOpen: boolean
  onClose: () => void
  isSaved: boolean
  onToggleSave: (id: string) => void
}

export function ScholarshipDetailsView({
  scholarship,
  assessment,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
}: ScholarshipDetailsViewProps) {
  if (!scholarship) return null

  const daysRemaining = calculateDaysRemaining(scholarship.deadline)
  const urgency = getUrgencyLevel(daysRemaining)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={scholarship.title}
      subtitle={`Offered by ${scholarship.provider} • ${scholarship.organizationType}`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Top Financial & Urgency Summary Banner */}
        <div className="p-4 rounded-xl bg-forest-900 text-warm-100 border border-forest-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-white">
                {scholarship.formattedAmount.split(' ')[0]}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-forest-800 text-emerald-400 border border-forest-700 font-mono">
                {scholarship.currency}
              </span>
              <span className="text-xs text-forest-200 bg-forest-950 px-2 py-0.5 rounded border border-forest-700">
                {scholarship.awardType === 'renewable'
                  ? 'Renewable Award'
                  : scholarship.awardType === 'annual'
                  ? 'Annual Award'
                  : 'One-time Grant'}
              </span>
            </div>
            {scholarship.renewalTerms && (
              <p className="text-xs text-forest-200 mt-1">{scholarship.renewalTerms}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <UrgencyBadge urgency={urgency} daysRemaining={daysRemaining} />
          </div>
        </div>

        {/* Core Eligibility Quick Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-warm-50 border border-warm-200 space-y-1">
            <span className="font-medium text-warm-500 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-forest-700" />
              Academic Minimum
            </span>
            <p className="text-sm font-bold text-forest-900">
              {scholarship.academicRequirement?.description || 'No minimum cutoff'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-warm-50 border border-warm-200 space-y-1">
            <span className="font-medium text-warm-500 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-forest-700" />
              Target Education Level
            </span>
            <p className="text-sm font-bold text-forest-900 capitalize truncate">
              {scholarship.educationLevels.join(', ')}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-warm-50 border border-warm-200 space-y-1">
            <span className="font-medium text-warm-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-forest-700" />
              Deadline
            </span>
            <p className="text-sm font-bold text-forest-900">
              {formatDisplayDate(scholarship.deadline)}
            </p>
          </div>
        </div>

        {/* Explainable Eligibility Assessment Card */}
        {assessment && <EligibilityBreakdownCard assessment={assessment} />}

        {/* Full Detailed Description */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-warm-600">
            About This Scholarship
          </h4>
          <p className="text-sm text-warm-800 leading-relaxed bg-warm-100/60 p-4 rounded-xl border border-warm-200">
            {scholarship.detailedDescription}
          </p>
        </div>

        {/* Geographic & Nationality Specifications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-warm-50 border border-warm-200 space-y-1">
            <span className="font-semibold text-warm-700 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-forest-700" />
              Eligible Applicant Countries
            </span>
            <p className="text-warm-800">
              {scholarship.eligibleCountries.includes('GLOBAL')
                ? 'Open to applicants globally.'
                : scholarship.eligibleCountries.join(', ')}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-warm-50 border border-warm-200 space-y-1">
            <span className="font-semibold text-warm-700 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-forest-700" />
              Approved Study Locations
            </span>
            <p className="text-warm-800">
              {scholarship.eligibleDestinations.includes('GLOBAL')
                ? 'Valid at accredited universities globally.'
                : scholarship.eligibleDestinations.join(', ')}
            </p>
          </div>
        </div>

        {/* Required Documents Checklist */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-warm-600 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-forest-700" />
            <span>Required Documents &amp; Submissions</span>
          </h4>
          <div className="space-y-1.5">
            {scholarship.requiredDocuments.map((doc, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-white border border-warm-300 text-xs text-warm-800 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0" />
                <span>{doc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Application Instructions */}
        <div className="p-3.5 bg-warm-50 rounded-xl border border-warm-200 text-xs text-warm-700 space-y-1">
          <p className="font-bold text-forest-900">Application Instructions</p>
          <p className="leading-relaxed">{scholarship.applicationInstructions}</p>
        </div>

        {/* Disbursement Details */}
        <div className="p-3.5 bg-warm-50 rounded-xl border border-warm-200 text-xs text-warm-700 space-y-1">
          <p className="font-bold text-forest-900 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Disbursement Details</span>
          </p>
          <p className="leading-relaxed">{scholarship.disbursementSchedule}</p>
        </div>

        {/* Modal Footer Controls */}
        <div className="pt-4 border-t border-warm-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-warm-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Demonstration scholarship record for platform evaluation.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant={isSaved ? 'secondary' : 'primary'}
              size="md"
              onClick={() => onToggleSave(scholarship.id)}
              className="w-full sm:w-auto"
              icon={<Bookmark className="w-4 h-4" />}
            >
              {isSaved ? 'Remove from Saved' : 'Save Scholarship'}
            </Button>
            <Button variant="outline" size="md" onClick={onClose} className="w-full sm:w-auto">
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
