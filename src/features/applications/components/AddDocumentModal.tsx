import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { FileText, Plus } from 'lucide-react'
import type { DocumentCategory, DocumentStatus } from '../types/application'

interface AddDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (doc: {
    title: string
    category: DocumentCategory
    required: boolean
    notes?: string
    status: DocumentStatus
  }) => void
}

const CATEGORY_OPTIONS: { value: DocumentCategory; label: string }[] = [
  { value: 'transcript', label: 'Academic Transcript' },
  { value: 'resume', label: 'CV / Resume' },
  { value: 'essay', label: 'Essay / Statement of Purpose' },
  { value: 'recommendation', label: 'Recommendation Letter' },
  { value: 'enrollment', label: 'Proof of Enrollment' },
  { value: 'portfolio', label: 'Portfolio / Code Repository' },
  { value: 'financial', label: 'Financial Need Verification' },
  { value: 'test_score', label: 'Test Scores / Certificates' },
  { value: 'custom', label: 'Other Custom Document' },
]

export function AddDocumentModal({ isOpen, onClose, onAdd }: AddDocumentModalProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<DocumentCategory>('essay')
  const [required, setRequired] = useState(true)
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<DocumentStatus>('not_started')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Document title or requirement name is required.')
      return
    }

    onAdd({
      title: title.trim(),
      category,
      required,
      notes: notes.trim() || undefined,
      status,
    })

    // Reset and close
    setTitle('')
    setCategory('essay')
    setRequired(true)
    setNotes('')
    setStatus('not_started')
    setError(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Document Requirement"
      subtitle="Define a submission requirement or upload target for this application."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-forest-900 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-forest-700" />
            <span>Document Title *</span>
          </label>
          <Input
            placeholder="e.g. Diversity & Inclusion Statement, Dean's Letter"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (error) setError(null)
            }}
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-forest-900">Document Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DocumentCategory)}
              className="w-full bg-white border border-warm-300 rounded-xl px-3 py-2 text-xs text-warm-900 focus-visible:outline-none focus-visible:border-forest-700"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-forest-900">Initial Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as DocumentStatus)}
              className="w-full bg-white border border-warm-300 rounded-xl px-3 py-2 text-xs text-warm-900 focus-visible:outline-none focus-visible:border-forest-700"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="ready">Ready / Obtained</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-forest-900">Notes or Guidance (Optional)</label>
          <textarea
            rows={2}
            placeholder="e.g. Must be signed by Department Chair; 2-page max length"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-white border border-warm-300 rounded-xl p-3 text-xs text-warm-900 focus-visible:outline-none focus-visible:border-forest-700 leading-relaxed"
          />
        </div>

        <div className="pt-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="req_checkbox"
            checked={required}
            onChange={(e) => setRequired(e.target.checked)}
            className="w-4 h-4 rounded text-forest-700 border-warm-300 focus:ring-forest-700 cursor-pointer"
          />
          <label htmlFor="req_checkbox" className="text-xs text-warm-700 cursor-pointer select-none">
            This document is mandatory for final submission
          </label>
        </div>

        <div className="pt-4 border-t border-warm-200 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
            Add Document
          </Button>
        </div>
      </form>
    </Modal>
  )
}
