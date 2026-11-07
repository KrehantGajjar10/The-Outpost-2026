import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { UrgencyBadge } from '../../../components/ui/Badge'
import { ApplicationStatusBadge } from './ApplicationStatusBadge'
import { DocumentChecklist } from './DocumentChecklist'
import { ApplicationTimeline } from './ApplicationTimeline'
import { StatusTransitionDialog } from './StatusTransitionDialog'
import { applicationService } from '../services/applicationService'
import { DEMO_SCHOLARSHIPS } from '../../scholarships/data/mockScholarships'
import {
  formatDisplayDate,
  calculateDaysRemaining,
  getUrgencyLevel,
} from '../../../lib/utils'
import {
  Calendar,
  ExternalLink,
  FileText,
  Clock,
  Award,
  CheckCircle2,
  Trash2,
  Save,
  Globe,
  ChevronRight,
} from 'lucide-react'
import type { TrackedApplication, ApplicationStatus } from '../types/application'

interface ApplicationWorkspaceModalProps {
  application: TrackedApplication | null
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
  onUntrack?: (appId: string) => void
}

type WorkspaceTab = 'documents' | 'overview' | 'notes' | 'timeline'

export function ApplicationWorkspaceModal({
  application,
  isOpen,
  onClose,
  onUpdate,
  onUntrack,
}: ApplicationWorkspaceModalProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('documents')
  const [notes, setNotes] = useState(application?.notes || '')
  const [targetDate, setTargetDate] = useState(application?.targetSubmissionDate || '')
  const [notesSaved, setNotesSaved] = useState(false)
  const [transitionTarget, setTransitionTarget] = useState<ApplicationStatus | null>(null)
  const [confirmUntrack, setConfirmUntrack] = useState(false)

  if (!application) return null

  const scholarship = DEMO_SCHOLARSHIPS.find((s) => s.id === application.scholarshipId)
  const effectiveDeadline = application.targetSubmissionDate || scholarship?.deadline || '2026-12-31'
  const daysRemaining = calculateDaysRemaining(effectiveDeadline)
  const urgency = getUrgencyLevel(daysRemaining)
  const readiness = applicationService.calculateReadiness(application.documents)

  const lifecycleStages: { status: ApplicationStatus; label: string }[] = [
    { status: 'planning', label: 'Planning' },
    { status: 'in_progress', label: 'In Progress' },
    { status: 'submitted', label: 'Submitted' },
    { status: 'under_review', label: 'Under Review' },
    { status: 'accepted', label: 'Awarded' },
  ]

  const handleSaveNotesAndDate = () => {
    applicationService.updateNotes(application.id, notes)
    if (targetDate && targetDate !== application.targetSubmissionDate) {
      applicationService.updateTargetDate(application.id, targetDate)
    }
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2500)
    onUpdate?.()
  }

  const handleStatusTransitionConfirm = (data: {
    status: ApplicationStatus
    notes?: string
    confirmationRef?: string
  }) => {
    applicationService.updateStatus(application.id, data.status, data.notes)
    if (data.confirmationRef) {
      applicationService.updateConfirmationReference(application.id, data.confirmationRef)
    }
    onUpdate?.()
  }

  const handleUntrack = () => {
    applicationService.untrackApplication(application.id)
    onUntrack?.(application.id)
    onClose()
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={scholarship?.title || 'Application Workspace'}
        subtitle={`Offered by ${scholarship?.provider || 'Scholarship Provider'} • Pipeline Tracking`}
        maxWidth="xl"
      >
        <div className="space-y-6">
          {/* Header Banner: Award, Urgency, Status */}
          <div className="p-4 rounded-xl bg-forest-900 text-warm-100 border border-forest-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight text-white">
                  {(scholarship?.formattedAmount || '$10,000').split(' ')[0]}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-forest-800 text-emerald-400 border border-forest-700 font-mono">
                  {scholarship?.currency || 'USD'}
                </span>
                <ApplicationStatusBadge status={application.status} size="md" />
              </div>
              <p className="text-xs text-forest-200 mt-1">
                Target Deadline:{' '}
                <span className="font-semibold text-white">
                  {formatDisplayDate(effectiveDeadline)}
                </span>{' '}
                ({daysRemaining >= 0 ? `${daysRemaining} days remaining` : `${Math.abs(daysRemaining)} days overdue`})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <UrgencyBadge urgency={urgency} daysRemaining={daysRemaining} />
              {application.officialPortalUrl && (
                <a
                  href={application.officialPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-forest-800 text-emerald-300 hover:bg-forest-700 flex items-center gap-1 border border-forest-700 transition-colors"
                  title="Open official provider application website"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Portal</span>
                </a>
              )}
            </div>
          </div>

          {/* Interactive Lifecycle Progress Stepper */}
          <div className="p-3 bg-warm-50 rounded-xl border border-warm-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-forest-900">Application Lifecycle Stage</span>
              <span className="text-warm-500 text-[11px]">
                Click any step to advance or adjust status
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
              {lifecycleStages.map((stage, idx) => {
                const isCurrent = application.status === stage.status
                const isPassed =
                  lifecycleStages.findIndex((s) => s.status === application.status) > idx

                return (
                  <button
                    key={stage.status}
                    type="button"
                    onClick={() => {
                      if (!isCurrent) setTransitionTarget(stage.status)
                    }}
                    className={`p-2 rounded-lg text-left transition-all cursor-pointer border ${
                      isCurrent
                        ? 'bg-forest-900 text-white border-forest-900 shadow-xs'
                        : isPassed
                        ? 'bg-emerald-50 text-forest-900 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-white text-warm-600 border-warm-200 hover:bg-warm-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono opacity-80">0{idx + 1}</span>
                      {isPassed && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {isCurrent && <ChevronRight className="w-3 h-3 text-emerald-400" />}
                    </div>
                    <p className="text-xs font-bold mt-1 truncate">{stage.label}</p>
                  </button>
                )
              })}
            </div>

            {/* Special terminal states (Withdrawn / Rejected) */}
            <div className="pt-2 border-t border-warm-200 flex items-center justify-between text-xs text-warm-500">
              <div className="flex items-center gap-2">
                <span>Other status options:</span>
                <button
                  type="button"
                  onClick={() => setTransitionTarget('withdrawn')}
                  className="hover:text-forest-900 underline cursor-pointer"
                >
                  Withdraw
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setTransitionTarget('rejected')}
                  className="hover:text-forest-900 underline cursor-pointer"
                >
                  Record Not Selected
                </button>
              </div>

              {application.confirmationReference && (
                <div className="text-[11px] font-mono text-forest-800 bg-white px-2 py-0.5 rounded border border-warm-300">
                  Ref: {application.confirmationReference}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-warm-200 gap-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('documents')}
              className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'documents'
                  ? 'border-forest-800 text-forest-900'
                  : 'border-transparent text-warm-500 hover:text-warm-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Document Checklist ({readiness.ready}/{readiness.total})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'notes'
                  ? 'border-forest-800 text-forest-900'
                  : 'border-transparent text-warm-500 hover:text-warm-900'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>Personal Notes &amp; Target</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('timeline')}
              className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'timeline'
                  ? 'border-forest-800 text-forest-900'
                  : 'border-transparent text-warm-500 hover:text-warm-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Activity History ({application.timeline.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'border-forest-800 text-forest-900'
                  : 'border-transparent text-warm-500 hover:text-warm-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Scholarship Details</span>
            </button>
          </div>

          {/* Tab 1: Document Checklist */}
          {activeTab === 'documents' && (
            <DocumentChecklist
              applicationId={application.id}
              documents={application.documents}
              onDocumentsChange={onUpdate}
            />
          )}

          {/* Tab 2: Personal Notes & Target Date */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-forest-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-forest-700" />
                    <span>Personal Target Submission Date</span>
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-white border border-warm-300 rounded-xl px-3 py-2 text-xs text-warm-900 focus-visible:outline-none focus-visible:border-forest-700"
                  />
                  <p className="text-[11px] text-warm-500">
                    Official deadline is {formatDisplayDate(scholarship?.deadline || '')}.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-forest-900 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-forest-700" />
                    <span>Official Application Link</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={application.officialPortalUrl || 'https://example.org/apply'}
                      className="w-full bg-warm-100/60 border border-warm-300 rounded-xl px-3 py-2 text-xs text-warm-700 font-mono"
                    />
                    <a
                      href={application.officialPortalUrl || 'https://example.org/apply'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-forest-900 text-white hover:bg-forest-800 shrink-0"
                      title="Open external website"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <p className="text-[11px] text-warm-500">
                    Simulated link demonstrating connection to official application portals.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-forest-900 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-forest-700" />
                  <span>Personal Notes &amp; Action Items</span>
                </label>
                <textarea
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record your essay outlines, recommender contact info, or interview prep questions..."
                  className="w-full bg-white border border-warm-300 rounded-xl p-3 text-xs text-warm-900 focus-visible:outline-none focus-visible:border-forest-700 leading-relaxed font-sans"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {notesSaved ? (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Changes saved successfully!
                  </span>
                ) : (
                  <span className="text-[11px] text-warm-500">
                    Last updated: {formatDisplayDate(application.updatedAt.slice(0, 10))}
                  </span>
                )}

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleSaveNotesAndDate}
                  icon={<Save className="w-4 h-4" />}
                >
                  Save Notes &amp; Schedule
                </Button>
              </div>
            </div>
          )}

          {/* Tab 3: Activity History / Timeline */}
          {activeTab === 'timeline' && <ApplicationTimeline timeline={application.timeline} />}

          {/* Tab 4: Scholarship Overview & Requirements */}
          {activeTab === 'overview' && scholarship && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-warm-50 rounded-xl border border-warm-200 space-y-1">
                <p className="font-bold text-forest-900">About the Scholarship</p>
                <p className="text-warm-700 leading-relaxed">
                  {scholarship.detailedDescription || scholarship.shortDescription}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-xl border border-warm-200 space-y-1">
                  <span className="font-semibold text-warm-500">Academic Requirement</span>
                  <p className="font-bold text-forest-900">
                    {scholarship.academicRequirement?.description || 'No minimum cutoff'}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-warm-200 space-y-1">
                  <span className="font-semibold text-warm-500">Disbursement</span>
                  <p className="text-warm-800">{scholarship.disbursementSchedule}</p>
                </div>
              </div>

              <div className="p-3.5 bg-warm-50 rounded-xl border border-warm-200 space-y-1">
                <p className="font-bold text-forest-900">Provider Application Instructions</p>
                <p className="text-warm-700 leading-relaxed">
                  {scholarship.applicationInstructions}
                </p>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-warm-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {confirmUntrack ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-700 font-semibold">Remove from tracking?</span>
                  <button
                    type="button"
                    onClick={handleUntrack}
                    className="text-xs font-bold text-rose-700 underline cursor-pointer"
                  >
                    Yes, Untrack
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmUntrack(false)}
                    className="text-xs text-warm-600 hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmUntrack(true)}
                  className="text-xs text-warm-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Untrack Scholarship</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button variant="outline" size="md" onClick={onClose} className="w-full sm:w-auto">
                Close Workspace
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Status Transition Dialog */}
      <StatusTransitionDialog
        isOpen={Boolean(transitionTarget)}
        onClose={() => setTransitionTarget(null)}
        targetStatus={transitionTarget}
        currentStatus={application.status}
        scholarshipTitle={scholarship?.title || 'Scholarship'}
        readyDocumentsRatio={readiness}
        onConfirm={handleStatusTransitionConfirm}
      />
    </>
  )
}
