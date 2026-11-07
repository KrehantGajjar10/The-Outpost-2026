import { useNavigate } from 'react-router-dom'
import { Modal } from '../../../components/ui/Modal'
import { Badge, UrgencyBadge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { formatDisplayDate } from '../../../lib/utils'
import { savedService } from '../../saved/services/savedService'
import { applicationService } from '../../applications/services/applicationService'
import type { Scholarship } from '../../scholarships/types/scholarship'
import {
  Calendar,
  CheckCircle2,
  Circle,
  Award,
  FileText,
  DollarSign,
  Bookmark,
  ShieldCheck,
  GraduationCap,
  Layers,
} from 'lucide-react'

interface ScholarshipDetailModalProps {
  scholarship: Scholarship | null
  isOpen: boolean
  onClose: () => void
  onToggleSave: (id: string) => void
}

export function ScholarshipDetailModal({
  scholarship,
  isOpen,
  onClose,
  onToggleSave,
}: ScholarshipDetailModalProps) {
  const navigate = useNavigate()
  if (!scholarship) return null

  const isSaved = scholarship.isSaved ?? savedService.isSaved(scholarship.id)
  const isTracked = applicationService.isScholarshipTracked(scholarship.id)

  const handleTrackOrOpenWorkspace = () => {
    let app = applicationService.getApplicationByScholarshipId(scholarship.id)
    if (!app) {
      app = applicationService.trackScholarship(scholarship.id, 'planning')
    }
    onClose()
    navigate(`/applications?appId=${app.id}`)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={scholarship.title}
      subtitle={`Offered by ${scholarship.provider} • ${scholarship.organizationType}`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Banner with key financial metrics */}
        <div className="p-4 rounded-xl bg-forest-900 text-warm-100 border border-forest-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-white">
                {(scholarship.formattedAmount || scholarship.amountFormatted || '').split(' ')[0]}
              </span>
              <span className="text-xs text-forest-200 bg-forest-950 px-2 py-0.5 rounded border border-forest-700">
                {scholarship.isRenewable || scholarship.awardType === 'renewable' ? 'Renewable Award' : 'One-time Grant'}
              </span>
            </div>
            {scholarship.renewalTerms && (
              <p className="text-xs text-forest-200 mt-1">{scholarship.renewalTerms}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <UrgencyBadge
              urgency={scholarship.urgency ?? 'normal'}
              daysRemaining={scholarship.daysRemaining ?? 0}
            />
          </div>
        </div>

        {/* Core Eligibility Criteria Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-warm-50 border border-warm-200 space-y-1">
            <span className="text-[11px] font-medium text-warm-500 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-forest-700" />
              Academic Standard
            </span>
            <p className="text-sm font-bold text-forest-900">
              {scholarship.minGpa
                ? `${scholarship.minGpa.toFixed(1)} Cumulative`
                : scholarship.academicRequirement?.description || 'Open / No Minimum'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-warm-50 border border-warm-200 space-y-1">
            <span className="text-[11px] font-medium text-warm-500 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-forest-700" />
              Target Academic Level
            </span>
            <p className="text-sm font-bold text-forest-900 truncate">
              {scholarship.academicLevel || (scholarship.educationLevels ? scholarship.educationLevels.join(', ') : 'All Levels')}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-warm-50 border border-warm-200 space-y-1">
            <span className="text-[11px] font-medium text-warm-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-forest-700" />
              Deadline
            </span>
            <p className="text-sm font-bold text-forest-900">
              {formatDisplayDate(scholarship.deadline)}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-warm-600">
            Overview & Scope
          </h4>
          <p className="text-sm text-warm-700 leading-relaxed bg-warm-100/50 p-3.5 rounded-xl border border-warm-200">
            {scholarship.detailedDescription || scholarship.shortDescription || scholarship.description || ''}
          </p>
        </div>

        {/* Requirements Checklist */}
        {scholarship.requirements && scholarship.requirements.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-warm-600">
                Required Application Checklist
              </h4>
              <span className="text-xs font-semibold text-forest-700">
                {scholarship.requirements.filter((r) => r.completed).length} of{' '}
                {scholarship.requirements.length} requirements ready
              </span>
            </div>

            <div className="space-y-2">
              {scholarship.requirements.map((req) => (
                <div
                  key={req.id}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    req.completed
                      ? 'bg-emerald-50/60 border-emerald-200 text-[#065f46]'
                      : 'bg-white border-warm-300 text-warm-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {req.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-warm-400 shrink-0" />
                    )}
                    <span className={req.completed ? 'font-medium' : ''}>{req.label}</span>
                  </div>
                  <Badge variant={req.completed ? 'success' : 'neutral'} size="sm">
                    {req.completed ? 'Ready' : 'Pending Action'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Essay Prompt if applicable */}
        {scholarship.essayPrompt && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-warm-600 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-forest-700" />
              Essay Prompt Focus
            </h4>
            <div className="p-3.5 rounded-xl bg-warm-50 border border-warm-200 text-xs text-warm-800 italic leading-relaxed">
              "{scholarship.essayPrompt}"
            </div>
          </div>
        )}

        {/* Disbursement Details */}
        <div className="space-y-1.5 text-xs text-warm-600 bg-warm-100 p-3 rounded-xl border border-warm-300">
          <p className="font-semibold text-warm-900 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            Disbursement Method
          </p>
          <p>{scholarship.disbursementSchedule}</p>
        </div>

        {/* Modal Footer Controls */}
        <div className="pt-4 border-t border-warm-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-warm-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Simulated demonstration record for prototype evaluation.</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant={isSaved ? 'secondary' : 'outline'}
              size="md"
              onClick={() => onToggleSave(scholarship.id)}
              className="w-full sm:w-auto"
              icon={<Bookmark className="w-4 h-4" />}
            >
              {isSaved ? 'Remove from Saved' : 'Save'}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleTrackOrOpenWorkspace}
              className="w-full sm:w-auto"
              icon={<Layers className="w-4 h-4" />}
            >
              {isTracked ? 'Open Workspace' : 'Track Application'}
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
