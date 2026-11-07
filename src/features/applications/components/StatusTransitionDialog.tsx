import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Send, Award, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react'
import type { ApplicationStatus } from '../types/application'

interface StatusTransitionDialogProps {
  isOpen: boolean
  onClose: () => void
  targetStatus: ApplicationStatus | null
  currentStatus: ApplicationStatus
  scholarshipTitle: string
  readyDocumentsRatio: { ready: number; total: number; percentage: number }
  onConfirm: (data: { status: ApplicationStatus; notes?: string; confirmationRef?: string }) => void
}

export function StatusTransitionDialog({
  isOpen,
  onClose,
  targetStatus,
  currentStatus,
  scholarshipTitle,
  readyDocumentsRatio,
  onConfirm,
}: StatusTransitionDialogProps) {
  const [confirmationRef, setConfirmationRef] = useState('')
  const [transitionNotes, setTransitionNotes] = useState('')

  if (!isOpen || !targetStatus) return null

  const handleConfirm = () => {
    onConfirm({
      status: targetStatus,
      notes: transitionNotes.trim() || undefined,
      confirmationRef: confirmationRef.trim() || undefined,
    })
    setConfirmationRef('')
    setTransitionNotes('')
    onClose()
  }

  const isSubmitting = targetStatus === 'submitted'
  const isAccepted = targetStatus === 'accepted'
  const isWithdrawn = targetStatus === 'withdrawn'
  const isRejected = targetStatus === 'rejected'

  const hasIncompleteDocs = isSubmitting && readyDocumentsRatio.ready < readyDocumentsRatio.total

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isSubmitting
          ? 'Record Application Submission'
          : isAccepted
          ? 'Congratulations on Your Award!'
          : isWithdrawn
          ? 'Withdraw Application'
          : isRejected
          ? 'Record Application Outcome'
          : `Change Status to ${targetStatus}`
      }
      subtitle={`Updating pipeline tracking (${currentStatus} → ${targetStatus}) for ${scholarshipTitle}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Submission Notice Banner */}
        {isSubmitting && (
          <div className="p-3.5 rounded-xl bg-forest-900 text-warm-100 border border-forest-800 space-y-2">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-white">Local Tracking Record Notice</p>
                <p className="text-forest-200 leading-relaxed">
                  Marking this application as submitted records your progress inside GRANTLY. GRANTLY
                  does not transmit external application data or submit on your behalf.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning if documents are not 100% ready */}
        {hasIncompleteDocs && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Incomplete Document Checklist</p>
              <p className="text-amber-800 mt-0.5">
                Only {readyDocumentsRatio.ready} of {readyDocumentsRatio.total} documents are marked
                "Ready" ({readyDocumentsRatio.percentage}%). You can still record this submission if you
                submitted via the provider portal directly.
              </p>
            </div>
          </div>
        )}

        {/* Celebratory message for accepted */}
        {isAccepted && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-[#065f46] text-xs flex items-start gap-3">
            <Award className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold">Outstanding Academic Achievement!</p>
              <p className="mt-1 leading-relaxed text-emerald-800">
                Recording this scholarship as awarded moves it into your successful financial aid
                portfolio. Be sure to note any scholarship renewal terms or acceptance deadlines below.
              </p>
            </div>
          </div>
        )}

        {/* Optional confirmation reference */}
        {isSubmitting && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-forest-900">
              Provider Application Reference / Confirmation Number (Optional)
            </label>
            <Input
              placeholder="e.g. APP-2026-9482, CONF-STEM-771"
              value={confirmationRef}
              onChange={(e) => setConfirmationRef(e.target.value)}
            />
            <p className="text-[11px] text-warm-500">
              Save the receipt code from the external scholarship website for future reference.
            </p>
          </div>
        )}

        {/* Notes for timeline */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-forest-900">
            {isSubmitting
              ? 'Submission Notes or Interview Dates'
              : isWithdrawn
              ? 'Reason for Withdrawal'
              : isRejected
              ? 'Feedback or Decision Notes'
              : 'Transition Note (Optional)'}
          </label>
          <textarea
            rows={3}
            placeholder={
              isSubmitting
                ? 'e.g. Uploaded all 3 essays on the university admissions portal at 3:30 PM.'
                : isWithdrawn
                ? 'e.g. Decided to focus on the Apex Technologists Grant instead.'
                : 'Add personal remarks for your activity timeline...'
            }
            value={transitionNotes}
            onChange={(e) => setTransitionNotes(e.target.value)}
            className="w-full bg-white border border-warm-300 rounded-xl p-3 text-xs text-warm-900 focus-visible:outline-none focus-visible:border-forest-700 leading-relaxed"
          />
        </div>

        {/* Dialog Actions */}
        <div className="pt-4 border-t border-warm-200 flex items-center justify-end gap-3">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={isWithdrawn || isRejected ? 'secondary' : 'primary'}
            size="md"
            onClick={handleConfirm}
            icon={
              isSubmitting ? (
                <Send className="w-4 h-4" />
              ) : isAccepted ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : undefined
            }
          >
            {isSubmitting
              ? 'Confirm Submission'
              : isAccepted
              ? 'Record Award'
              : isWithdrawn
              ? 'Withdraw Application'
              : 'Update Status'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
