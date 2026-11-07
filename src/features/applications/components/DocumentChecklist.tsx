import { useState, useRef } from 'react'
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Paperclip,
  Trash2,
  Download,
  Info,
  Sparkles,
} from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { AddDocumentModal } from './AddDocumentModal'
import {
  applicationService,
  DEFAULT_DOCUMENT_TEMPLATES,
} from '../services/applicationService'
import { documentStorage, formatFileSize, MAX_FILE_SIZE_BYTES } from '../services/documentStorage'
import type {
  ApplicationDocument,
  DocumentCategory,
  DocumentStatus,
} from '../types/application'

interface DocumentChecklistProps {
  applicationId: string
  documents: ApplicationDocument[]
  onDocumentsChange?: () => void
}

export function DocumentChecklist({
  applicationId,
  documents,
  onDocumentsChange,
}: DocumentChecklistProps) {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [activeUploadDocId, setActiveUploadDocId] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const readiness = applicationService.calculateReadiness(documents)

  const handleStatusChange = (docId: string, newStatus: DocumentStatus) => {
    applicationService.updateDocumentStatus(applicationId, docId, newStatus)
    onDocumentsChange?.()
  }

  const handleAddDocument = (newDocData: {
    title: string
    category: DocumentCategory
    required: boolean
    notes?: string
    status: DocumentStatus
  }) => {
    applicationService.addDocument(applicationId, newDocData)
    onDocumentsChange?.()
  }

  const handleRemoveDocument = (docId: string) => {
    applicationService.removeDocument(applicationId, docId)
    documentStorage.deleteAttachment(docId)
    onDocumentsChange?.()
  }

  const handleTriggerUpload = (docId: string) => {
    setActiveUploadDocId(docId)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeUploadDocId) return

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError(
        `File "${file.name}" exceeds the 2MB browser storage limit (${formatFileSize(file.size)}).`,
      )
      return
    }

    try {
      const dataUrl = await documentStorage.readFileAsDataURL(file)
      // Save in document storage
      documentStorage.saveAttachment(activeUploadDocId, {
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        data: dataUrl,
      })

      // Update application document item
      applicationService.attachFileToDocument(applicationId, activeUploadDocId, {
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        data: dataUrl,
      })

      onDocumentsChange?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error attaching file.'
      setUploadError(message)
    } finally {
      setActiveUploadDocId(null)
    }
  }

  const handleRemoveFile = (docId: string) => {
    documentStorage.deleteAttachment(docId)
    applicationService.removeFileFromDocument(applicationId, docId)
    onDocumentsChange?.()
  }

  const handleAddStandardTemplates = () => {
    const existingTitles = documents.map((d) => d.title.toLowerCase())
    for (const tmpl of DEFAULT_DOCUMENT_TEMPLATES) {
      const isPresent = existingTitles.some((t) => t.includes(tmpl.title.toLowerCase().slice(0, 10)))
      if (!isPresent) {
        applicationService.addDocument(applicationId, {
          title: tmpl.title,
          category: tmpl.category,
          required: tmpl.required,
          status: 'not_started',
        })
      }
    }
    onDocumentsChange?.()
  }

  return (
    <div className="space-y-5">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelected}
        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
      />

      {/* Progress & Readiness Banner */}
      <div className="p-4 rounded-xl bg-warm-50 border border-warm-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-forest-900">Document Readiness</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-forest-900 text-emerald-300 font-mono">
                {readiness.percentage}%
              </span>
            </div>
            <p className="text-xs text-warm-600 mt-0.5">
              {readiness.ready} of {readiness.total} documents ready •{' '}
              {readiness.inProgress} in progress • {readiness.total - readiness.ready - readiness.inProgress} pending
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddStandardTemplates}
              icon={<Sparkles className="w-3.5 h-3.5 text-forest-700" />}
            >
              Add Standard Templates
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setAddModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Document
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-warm-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-forest-800 h-2 rounded-full transition-all duration-300"
            style={{ width: `${readiness.percentage}%` }}
          />
        </div>

        {/* Local Storage Notice */}
        <div className="flex items-center gap-1.5 text-[11px] text-warm-500 pt-1 border-t border-warm-200">
          <Info className="w-3.5 h-3.5 text-forest-700 shrink-0" />
          <span>
            Local-only browser storage. Files attached here are stored securely inside your browser and
            are never uploaded to external servers.
          </span>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-warm-200 space-y-3">
          <FileText className="w-8 h-8 text-warm-400 mx-auto" />
          <p className="text-sm font-semibold text-forest-900">No documents listed yet.</p>
          <p className="text-xs text-warm-500 max-w-sm mx-auto">
            Add custom document items or click "Add Standard Templates" to initialize common application requirements.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddStandardTemplates}
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Load Standard Checklist
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => {
            const isReady = doc.status === 'ready'
            const isInProgress = doc.status === 'in_progress'

            return (
              <div
                key={doc.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isReady
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : isInProgress
                    ? 'bg-amber-50/40 border-amber-200'
                    : 'bg-white border-warm-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Document Info */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isReady ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : isInProgress ? (
                        <Clock className="w-5 h-5 text-amber-accent shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-warm-400 shrink-0" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-forest-900">{doc.title}</span>
                        <Badge variant="neutral" size="sm">
                          {doc.category}
                        </Badge>
                        {doc.required ? (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                            Required
                          </span>
                        ) : (
                          <span className="text-[10px] text-warm-500 bg-warm-100 px-1.5 py-0.2 rounded">
                            Optional
                          </span>
                        )}
                      </div>

                      {doc.notes && (
                        <p className="text-xs text-warm-600 italic leading-relaxed">{doc.notes}</p>
                      )}

                      {/* File Attachment status */}
                      {doc.fileName ? (
                        <div className="flex items-center gap-2 pt-1 text-xs text-forest-800">
                          <Paperclip className="w-3.5 h-3.5 text-forest-700" />
                          <span className="font-semibold underline truncate max-w-xs" title={doc.fileName}>
                            {doc.fileName}
                          </span>
                          <span className="text-[10px] text-warm-500">
                            ({formatFileSize(doc.fileSize || 0)})
                          </span>
                          {doc.fileData && (
                            <a
                              href={doc.fileData}
                              download={doc.fileName}
                              className="text-[11px] text-forest-700 hover:text-forest-900 flex items-center gap-1 cursor-pointer font-medium ml-1"
                              title="Download local attachment"
                            >
                              <Download className="w-3 h-3" />
                              Save
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(doc.id)}
                            className="text-[10px] text-rose-600 hover:text-rose-800 cursor-pointer ml-1"
                          >
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <div className="pt-0.5">
                          <button
                            type="button"
                            onClick={() => handleTriggerUpload(doc.id)}
                            className="text-[11px] text-forest-700 hover:text-forest-900 font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                          >
                            <Paperclip className="w-3 h-3" />
                            Attach local draft/proof file (max 2MB)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Status selector & Delete action */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-warm-200">
                    <select
                      value={doc.status}
                      onChange={(e) => handleStatusChange(doc.id, e.target.value as DocumentStatus)}
                      className={`text-xs font-semibold rounded-lg px-2.5 py-1 border cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-forest-700 ${
                        isReady
                          ? 'bg-emerald-100 text-[#065f46] border-emerald-300'
                          : isInProgress
                          ? 'bg-amber-100 text-amber-accent border-amber-300'
                          : 'bg-white text-warm-700 border-warm-300'
                      }`}
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="ready">Ready</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveDocument(doc.id)}
                      className="p-1.5 text-warm-400 hover:text-rose-600 rounded-lg hover:bg-warm-100 transition-colors cursor-pointer"
                      title="Remove requirement"
                      aria-label="Remove requirement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Document Modal */}
      <AddDocumentModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddDocument}
      />
    </div>
  )
}
