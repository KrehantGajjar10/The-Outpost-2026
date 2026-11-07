import { storage } from '../../../services/storage'
import { DEMO_SCHOLARSHIPS } from '../../scholarships/data/mockScholarships'
import type {
  TrackedApplication,
  ApplicationStatus,
  ApplicationDocument,
  DocumentStatus,
  ApplicationTimelineEvent,
} from '../types/application'

export const APPLICATIONS_STORAGE_KEY = 'grantly_tracked_applications'
export const APPLICATION_CHANGED_EVENT = 'grantly:application_changed'

export const DEFAULT_DOCUMENT_TEMPLATES = [
  { title: 'Official Academic Transcript', category: 'transcript' as const, required: true },
  { title: 'Curriculum Vitae / Resume', category: 'resume' as const, required: true },
  { title: 'Personal Statement / Statement of Purpose', category: 'essay' as const, required: true },
  { title: 'Academic Recommendation Letter 1', category: 'recommendation' as const, required: true },
  { title: 'Academic / Professional Reference 2', category: 'recommendation' as const, required: false },
  { title: 'Proof of Current Enrollment / Student ID', category: 'enrollment' as const, required: false },
  { title: 'Financial Need Documentation', category: 'financial' as const, required: false },
  { title: 'Technical Portfolio / Work Repository', category: 'portfolio' as const, required: false },
]

export const INITIAL_DEMO_APPLICATIONS: TrackedApplication[] = [
  {
    id: 'app-sch-horizon-stem-2026',
    scholarshipId: 'sch-horizon-stem-2026',
    status: 'in_progress',
    customStageLabel: 'Final Review & Portfolio Upload',
    notes: 'Submitted initial questionnaire. Need to polish final draft of leadership essay before Nov 14.',
    targetSubmissionDate: '2026-11-12',
    officialPortalUrl: 'https://example.org/horizon-stem/apply',
    createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-11-05T14:30:00.000Z',
    documents: [
      {
        id: 'doc-horizon-1',
        title: 'Official Academic Transcript (Cumulative 3.84 GPA)',
        category: 'transcript',
        status: 'ready',
        required: true,
        fileName: 'alex_chen_transcript_2026.pdf',
        fileSize: 420000,
        fileType: 'application/pdf',
        updatedAt: '2026-10-20T11:00:00.000Z',
      },
      {
        id: 'doc-horizon-2',
        title: '500-word Essay on Technical Leadership',
        category: 'essay',
        status: 'in_progress',
        required: true,
        notes: 'Draft 2 completed. Currently at 480 words focusing on open-source mentorship.',
        fileName: 'leadership_essay_draft2.docx',
        fileSize: 32000,
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        updatedAt: '2026-11-04T16:20:00.000Z',
      },
      {
        id: 'doc-horizon-3',
        title: 'Two Letters of Recommendation',
        category: 'recommendation',
        status: 'in_progress',
        required: true,
        notes: 'Prof. Garcia confirmed submission. Waiting on secondary reference from Lab Director.',
        updatedAt: '2026-11-03T09:15:00.000Z',
      },
      {
        id: 'doc-horizon-4',
        title: 'Technical Portfolio Repository Link',
        category: 'portfolio',
        status: 'ready',
        required: true,
        notes: 'Verified repository README and project demo links.',
        updatedAt: '2026-10-25T13:40:00.000Z',
      },
    ],
    timeline: [
      {
        id: 'time-horizon-1',
        type: 'created',
        title: 'Application Tracking Initiated',
        description: 'Added Horizon Women in STEM Leadership Grant to active pipeline.',
        timestamp: '2026-10-15T10:00:00.000Z',
      },
      {
        id: 'time-horizon-2',
        type: 'document_update',
        title: 'Transcript Uploaded',
        description: 'Uploaded official transcript with verified 3.84 cumulative GPA.',
        timestamp: '2026-10-20T11:00:00.000Z',
      },
      {
        id: 'time-horizon-3',
        type: 'status_change',
        title: 'Moved to In Progress',
        description: 'Started essay writing and requested academic reference letters.',
        timestamp: '2026-10-25T14:00:00.000Z',
        previousStatus: 'planning',
        newStatus: 'in_progress',
      },
    ],
  },
  {
    id: 'app-sch-civic-impact-2026',
    scholarshipId: 'sch-civic-impact-2026',
    status: 'in_progress',
    customStageLabel: 'Pending Verification Letter',
    notes: 'Civic essay drafted. Following up with local community council for volunteer hour certification.',
    targetSubmissionDate: '2026-11-22',
    officialPortalUrl: 'https://example.org/civic-leadership/fellowship',
    createdAt: '2026-10-18T12:00:00.000Z',
    updatedAt: '2026-11-02T10:15:00.000Z',
    documents: [
      {
        id: 'doc-civic-1',
        title: 'Statement of Civic Commitment (750 words)',
        category: 'essay',
        status: 'in_progress',
        required: true,
        notes: 'Section 1 and 2 outlined. Connecting digital open data project to municipal impact.',
        updatedAt: '2026-10-29T15:00:00.000Z',
      },
      {
        id: 'doc-civic-2',
        title: 'Community Service Verification Letter',
        category: 'custom',
        status: 'not_started',
        required: true,
        notes: 'Contacted NGO director Dr. Vance. Letter expected by Friday.',
        updatedAt: '2026-10-18T12:00:00.000Z',
      },
      {
        id: 'doc-civic-3',
        title: 'Resume Detailing Public Sector / Volunteer Projects',
        category: 'resume',
        status: 'ready',
        required: true,
        fileName: 'alex_chen_civic_cv.pdf',
        fileSize: 185000,
        fileType: 'application/pdf',
        updatedAt: '2026-11-01T11:00:00.000Z',
      },
    ],
    timeline: [
      {
        id: 'time-civic-1',
        type: 'created',
        title: 'Application Created',
        description: 'Initialized tracking for Civic Impact & Public Policy Fellowship.',
        timestamp: '2026-10-18T12:00:00.000Z',
      },
      {
        id: 'time-civic-2',
        type: 'document_update',
        title: 'Resume Attached',
        description: 'Attached updated resume highlighting civic volunteer projects.',
        timestamp: '2026-11-01T11:00:00.000Z',
      },
    ],
  },
  {
    id: 'app-sch-apex-tech-2026',
    scholarshipId: 'sch-apex-tech-2026',
    status: 'in_progress',
    customStageLabel: 'Faculty Endorsement Stage',
    notes: 'Drafting architecture document for accessible screen-reader browser extension.',
    targetSubmissionDate: '2026-12-05',
    officialPortalUrl: 'https://example.org/apex-tech/consortium',
    createdAt: '2026-10-22T08:30:00.000Z',
    updatedAt: '2026-11-04T12:00:00.000Z',
    documents: [
      {
        id: 'doc-apex-1',
        title: 'Open Source Software Project Architecture Spec',
        category: 'portfolio',
        status: 'ready',
        required: true,
        fileName: 'accessibility_reader_spec.pdf',
        fileSize: 310000,
        fileType: 'application/pdf',
        updatedAt: '2026-11-02T16:00:00.000Z',
      },
      {
        id: 'doc-apex-2',
        title: 'Faculty Endorsement Letter',
        category: 'recommendation',
        status: 'in_progress',
        required: true,
        notes: 'Prof. Miller reviewed prototype code; drafting recommendation letter.',
        updatedAt: '2026-11-04T12:00:00.000Z',
      },
      {
        id: 'doc-apex-3',
        title: 'Official Undergraduate Transcript',
        category: 'transcript',
        status: 'ready',
        required: true,
        fileName: 'alex_chen_transcript_2026.pdf',
        fileSize: 420000,
        fileType: 'application/pdf',
        updatedAt: '2026-10-25T09:00:00.000Z',
      },
    ],
    timeline: [
      {
        id: 'time-apex-1',
        type: 'created',
        title: 'Tracking Started',
        description: 'Added Apex Future Technologists Merit Award to pipeline.',
        timestamp: '2026-10-22T08:30:00.000Z',
      },
      {
        id: 'time-apex-2',
        type: 'document_update',
        title: 'Technical Spec Attached',
        description: 'Uploaded accessibility extension architecture design specification.',
        timestamp: '2026-11-02T16:00:00.000Z',
      },
    ],
  },
  {
    id: 'app-sch-nordic-sustainability-2026',
    scholarshipId: 'sch-nordic-sustainability-2026',
    status: 'submitted',
    customStageLabel: 'Submitted to Board',
    confirmationReference: 'NORD-2026-8910',
    notes: 'Submitted via Stockholm university admissions portal. Confirmation email received.',
    targetSubmissionDate: '2026-10-28',
    officialPortalUrl: 'https://example.org/nordic-scholarships/portal',
    createdAt: '2026-10-01T09:00:00.000Z',
    updatedAt: '2026-10-28T16:45:00.000Z',
    documents: [
      {
        id: 'doc-nordic-1',
        title: 'Motivation & Climate Impact Statement',
        category: 'essay',
        status: 'ready',
        required: true,
        fileName: 'climate_policy_statement.pdf',
        fileSize: 220000,
        fileType: 'application/pdf',
        updatedAt: '2026-10-26T14:00:00.000Z',
      },
      {
        id: 'doc-nordic-2',
        title: 'European Format Academic CV',
        category: 'resume',
        status: 'ready',
        required: true,
        fileName: 'europass_cv_chen.pdf',
        fileSize: 195000,
        fileType: 'application/pdf',
        updatedAt: '2026-10-27T10:00:00.000Z',
      },
      {
        id: 'doc-nordic-3',
        title: 'Certified Degree Transcript',
        category: 'transcript',
        status: 'ready',
        required: true,
        fileName: 'certified_transcript.pdf',
        fileSize: 410000,
        fileType: 'application/pdf',
        updatedAt: '2026-10-25T11:00:00.000Z',
      },
    ],
    timeline: [
      {
        id: 'time-nordic-1',
        type: 'created',
        title: 'Application Created',
        description: 'Tracking initiated for Nordic Sustainability & Clean Tech Fellowship.',
        timestamp: '2026-10-01T09:00:00.000Z',
      },
      {
        id: 'time-nordic-2',
        type: 'status_change',
        title: 'Application Submitted',
        description: 'Recorded submission on institutional admissions portal. Confirmation: NORD-2026-8910.',
        timestamp: '2026-10-28T16:45:00.000Z',
        previousStatus: 'in_progress',
        newStatus: 'submitted',
      },
    ],
  },
]

export const applicationService = {
  /**
   * Get all tracked applications from storage (or seed defaults)
   */
  getApplications(): TrackedApplication[] {
    const apps = storage.getItem<TrackedApplication[]>(
      APPLICATIONS_STORAGE_KEY,
      INITIAL_DEMO_APPLICATIONS,
    )
    if (!Array.isArray(apps)) {
      return INITIAL_DEMO_APPLICATIONS
    }
    return apps
  },

  /**
   * Get application by its application ID
   */
  getApplication(id: string): TrackedApplication | null {
    const apps = this.getApplications()
    return apps.find((a) => a.id === id) || null
  },

  /**
   * Get application by scholarship ID
   */
  getApplicationByScholarshipId(scholarshipId: string): TrackedApplication | null {
    const apps = this.getApplications()
    return apps.find((a) => a.scholarshipId === scholarshipId) || null
  },

  /**
   * Check if a scholarship is currently tracked in the application pipeline
   */
  isScholarshipTracked(scholarshipId: string): boolean {
    return Boolean(this.getApplicationByScholarshipId(scholarshipId))
  },

  /**
   * Track a scholarship in the application workspace
   */
  trackScholarship(scholarshipId: string, initialStatus: ApplicationStatus = 'planning'): TrackedApplication {
    const existing = this.getApplicationByScholarshipId(scholarshipId)
    if (existing) {
      return existing
    }

    const scholarship = DEMO_SCHOLARSHIPS.find((s) => s.id === scholarshipId)
    const docItems: ApplicationDocument[] = []

    if (scholarship && scholarship.requiredDocuments.length > 0) {
      scholarship.requiredDocuments.forEach((docTitle, idx) => {
        let cat: ApplicationDocument['category'] = 'custom'
        const lower = docTitle.toLowerCase()
        if (lower.includes('transcript')) cat = 'transcript'
        else if (lower.includes('essay') || lower.includes('statement')) cat = 'essay'
        else if (lower.includes('recommendation') || lower.includes('reference')) cat = 'recommendation'
        else if (lower.includes('resume') || lower.includes('cv')) cat = 'resume'
        else if (lower.includes('portfolio') || lower.includes('repository')) cat = 'portfolio'
        else if (lower.includes('enrollment') || lower.includes('student')) cat = 'enrollment'

        docItems.push({
          id: `doc-${scholarshipId}-${idx + 1}`,
          title: docTitle,
          category: cat,
          status: 'not_started',
          required: true,
          updatedAt: new Date().toISOString(),
        })
      })
    } else {
      DEFAULT_DOCUMENT_TEMPLATES.slice(0, 3).forEach((tmpl, idx) => {
        docItems.push({
          id: `doc-${scholarshipId}-tmpl-${idx + 1}`,
          title: tmpl.title,
          category: tmpl.category,
          status: 'not_started',
          required: tmpl.required,
          updatedAt: new Date().toISOString(),
        })
      })
    }

    const now = new Date().toISOString()
    const newApp: TrackedApplication = {
      id: `app-${scholarshipId}`,
      scholarshipId,
      status: initialStatus,
      customStageLabel: initialStatus === 'planning' ? 'Planning & Guidelines' : 'In Progress',
      notes: '',
      targetSubmissionDate: scholarship?.deadline,
      officialPortalUrl: `https://example.org/apply/${scholarshipId}`,
      createdAt: now,
      updatedAt: now,
      documents: docItems,
      timeline: [
        {
          id: `time-${scholarshipId}-init`,
          type: 'created',
          title: 'Application Tracking Started',
          description: `Added "${scholarship?.title || scholarshipId}" to your application pipeline.`,
          timestamp: now,
        },
      ],
    }

    const currentApps = this.getApplications()
    const updated = [newApp, ...currentApps]
    this.saveApplications(updated)
    return newApp
  },

  /**
   * Update application status with timeline recording and validation
   */
  updateStatus(
    applicationId: string,
    newStatus: ApplicationStatus,
    reasonOrNote?: string,
  ): boolean {
    const apps = this.getApplications()
    const appIndex = apps.findIndex((a) => a.id === applicationId)
    if (appIndex === -1) return false

    const app = apps[appIndex]
    const previousStatus = app.status
    if (previousStatus === newStatus) return true

    const now = new Date().toISOString()
    const statusLabels: Record<ApplicationStatus, string> = {
      planning: 'Planning',
      in_progress: 'In Progress',
      submitted: 'Submitted',
      under_review: 'Under Review',
      accepted: 'Accepted / Awarded',
      rejected: 'Not Selected',
      withdrawn: 'Withdrawn',
    }

    const timelineEvent: ApplicationTimelineEvent = {
      id: `time-${Date.now()}`,
      type: 'status_change',
      title: `Status changed to ${statusLabels[newStatus]}`,
      description: reasonOrNote || `Application stage changed from ${statusLabels[previousStatus]} to ${statusLabels[newStatus]}.`,
      timestamp: now,
      previousStatus,
      newStatus,
    }

    const updatedApp: TrackedApplication = {
      ...app,
      status: newStatus,
      customStageLabel: statusLabels[newStatus],
      updatedAt: now,
      timeline: [timelineEvent, ...app.timeline],
    }

    apps[appIndex] = updatedApp
    return this.saveApplications(apps)
  },

  /**
   * Update application personal notes
   */
  updateNotes(applicationId: string, notes: string): boolean {
    const apps = this.getApplications()
    const appIndex = apps.findIndex((a) => a.id === applicationId)
    if (appIndex === -1) return false

    const now = new Date().toISOString()
    apps[appIndex] = {
      ...apps[appIndex],
      notes,
      updatedAt: now,
      timeline: [
        {
          id: `time-note-${Date.now()}`,
          type: 'note_added',
          title: 'Personal Notes Updated',
          description: 'Updated application notes and next-step actions.',
          timestamp: now,
        },
        ...apps[appIndex].timeline,
      ],
    }

    return this.saveApplications(apps)
  },

  /**
   * Update target submission date
   */
  updateTargetDate(applicationId: string, dateString: string): boolean {
    const apps = this.getApplications()
    const appIndex = apps.findIndex((a) => a.id === applicationId)
    if (appIndex === -1) return false

    const now = new Date().toISOString()
    apps[appIndex] = {
      ...apps[appIndex],
      targetSubmissionDate: dateString,
      updatedAt: now,
      timeline: [
        {
          id: `time-date-${Date.now()}`,
          type: 'target_date_set',
          title: 'Target Submission Date Updated',
          description: `Target submission date scheduled for ${dateString}.`,
          timestamp: now,
        },
        ...apps[appIndex].timeline,
      ],
    }

    return this.saveApplications(apps)
  },

  /**
   * Update submission confirmation reference
   */
  updateConfirmationReference(applicationId: string, ref: string): boolean {
    const apps = this.getApplications()
    const appIndex = apps.findIndex((a) => a.id === applicationId)
    if (appIndex === -1) return false

    apps[appIndex] = {
      ...apps[appIndex],
      confirmationReference: ref,
      updatedAt: new Date().toISOString(),
    }

    return this.saveApplications(apps)
  },

  /**
   * Untrack an application from the pipeline
   */
  untrackApplication(applicationId: string): boolean {
    const apps = this.getApplications()
    const filtered = apps.filter((a) => a.id !== applicationId)
    if (filtered.length === apps.length) return false
    return this.saveApplications(filtered)
  },

  /**
   * Document operations: Update status
   */
  updateDocumentStatus(
    applicationId: string,
    documentId: string,
    status: DocumentStatus,
  ): boolean {
    const apps = this.getApplications()
    const appIndex = apps.findIndex((a) => a.id === applicationId)
    if (appIndex === -1) return false

    const app = apps[appIndex]
    const docIndex = app.documents.findIndex((d) => d.id === documentId)
    if (docIndex === -1) return false

    const doc = app.documents[docIndex]
    const now = new Date().toISOString()
    const statusLabels: Record<DocumentStatus, string> = {
      not_started: 'Not Started',
      in_progress: 'In Progress',
      ready: 'Ready',
    }

    const updatedDoc: ApplicationDocument = {
      ...doc,
      status,
      updatedAt: now,
    }

    const updatedDocuments = [...app.documents]
    updatedDocuments[docIndex] = updatedDoc

    const timelineEvent: ApplicationTimelineEvent = {
      id: `time-doc-${Date.now()}`,
      type: 'document_update',
      title: `Document: ${doc.title}`,
      description: `Marked "${doc.title}" as ${statusLabels[status]}.`,
      timestamp: now,
    }

    apps[appIndex] = {
      ...app,
      documents: updatedDocuments,
      updatedAt: now,
      timeline: [timelineEvent, ...app.timeline],
    }

    return this.saveApplications(apps)
  },

  /**
   * Add a custom document to an application
   */
  addDocument(
    applicationId: string,
    docData: Omit<ApplicationDocument, 'id' | 'updatedAt'>,
  ): ApplicationDocument | null {
    const apps = this.getApplications()
    const appIndex = apps.findIndex((a) => a.id === applicationId)
    if (appIndex === -1) return null

    const app = apps[appIndex]
    const now = new Date().toISOString()
    const newDoc: ApplicationDocument = {
      ...docData,
      id: `doc-custom-${Date.now()}`,
      updatedAt: now,
    }

    apps[appIndex] = {
      ...app,
      documents: [...app.documents, newDoc],
      updatedAt: now,
      timeline: [
        {
          id: `time-adddoc-${Date.now()}`,
          type: 'document_update',
          title: `Added Requirement: ${newDoc.title}`,
          description: `Added "${newDoc.title}" to application checklist.`,
          timestamp: now,
        },
        ...app.timeline,
      ],
    }

    const success = this.saveApplications(apps)
    return success ? newDoc : null
  },

  /**
   * Remove a document from an application
   */
  removeDocument(applicationId: string, documentId: string): boolean {
    const apps = this.getApplications()
    const appIndex = apps.findIndex((a) => a.id === applicationId)
    if (appIndex === -1) return false

    const app = apps[appIndex]
    const removedDoc = app.documents.find((d) => d.id === documentId)
    const filteredDocs = app.documents.filter((d) => d.id !== documentId)

    const now = new Date().toISOString()
    apps[appIndex] = {
      ...app,
      documents: filteredDocs,
      updatedAt: now,
      timeline: removedDoc
        ? [
            {
              id: `time-remdoc-${Date.now()}`,
              type: 'document_update',
              title: `Removed Requirement: ${removedDoc.title}`,
              description: `Removed "${removedDoc.title}" from checklist.`,
              timestamp: now,
            },
            ...app.timeline,
          ]
        : app.timeline,
    }

    return this.saveApplications(apps)
  },

  /**
   * Attach file metadata (stored in doc record) and mark ready
   */
  attachFileToDocument(
    applicationId: string,
    documentId: string,
    fileInfo: { name: string; type: string; size: number; data?: string },
  ): boolean {
    const apps = this.getApplications()
    const appIndex = apps.findIndex((a) => a.id === applicationId)
    if (appIndex === -1) return false

    const app = apps[appIndex]
    const docIndex = app.documents.findIndex((d) => d.id === documentId)
    if (docIndex === -1) return false

    const doc = app.documents[docIndex]
    const now = new Date().toISOString()

    const updatedDoc: ApplicationDocument = {
      ...doc,
      fileName: fileInfo.name,
      fileType: fileInfo.type,
      fileSize: fileInfo.size,
      fileData: fileInfo.data,
      uploadedAt: now,
      status: 'ready',
      updatedAt: now,
    }

    const updatedDocs = [...app.documents]
    updatedDocs[docIndex] = updatedDoc

    apps[appIndex] = {
      ...app,
      documents: updatedDocs,
      updatedAt: now,
      timeline: [
        {
          id: `time-att-${Date.now()}`,
          type: 'document_update',
          title: `File Attached: ${fileInfo.name}`,
          description: `Attached "${fileInfo.name}" to requirement "${doc.title}".`,
          timestamp: now,
        },
        ...app.timeline,
      ],
    }

    return this.saveApplications(apps)
  },

  /**
   * Remove file from document
   */
  removeFileFromDocument(applicationId: string, documentId: string): boolean {
    const apps = this.getApplications()
    const appIndex = apps.findIndex((a) => a.id === applicationId)
    if (appIndex === -1) return false

    const app = apps[appIndex]
    const docIndex = app.documents.findIndex((d) => d.id === documentId)
    if (docIndex === -1) return false

    const doc = app.documents[docIndex]
    const now = new Date().toISOString()

    const updatedDoc: ApplicationDocument = {
      ...doc,
      fileName: undefined,
      fileType: undefined,
      fileSize: undefined,
      fileData: undefined,
      uploadedAt: undefined,
      updatedAt: now,
    }

    const updatedDocs = [...app.documents]
    updatedDocs[docIndex] = updatedDoc

    apps[appIndex] = {
      ...app,
      documents: updatedDocs,
      updatedAt: now,
    }

    return this.saveApplications(apps)
  },

  /**
   * Calculate document readiness metrics
   */
  calculateReadiness(documents: ApplicationDocument[]) {
    if (!documents || documents.length === 0) {
      return { total: 0, ready: 0, inProgress: 0, percentage: 100 }
    }
    const total = documents.length
    const ready = documents.filter((d) => d.status === 'ready').length
    const inProgress = documents.filter((d) => d.status === 'in_progress').length
    const percentage = Math.round((ready / total) * 100)
    return { total, ready, inProgress, percentage }
  },

  /**
   * Save applications list to storage and broadcast event
   */
  saveApplications(applications: TrackedApplication[]): boolean {
    const success = storage.setItem(APPLICATIONS_STORAGE_KEY, applications)
    if (success && typeof window !== 'undefined') {
      try {
        window.dispatchEvent(
          new CustomEvent<TrackedApplication[]>(APPLICATION_CHANGED_EVENT, {
            detail: applications,
          }),
        )
      } catch (e) {
        console.warn('Failed to dispatch application changed event:', e)
      }
    }
    return success
  },

  /**
   * Reset applications to default initial state (useful for test and demo reset)
   */
  resetApplications(): boolean {
    return this.saveApplications(INITIAL_DEMO_APPLICATIONS)
  },
}
