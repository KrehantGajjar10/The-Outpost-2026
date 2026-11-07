import { describe, it, expect, beforeEach } from 'vitest'
import {
  applicationService,
  APPLICATIONS_STORAGE_KEY,
  INITIAL_DEMO_APPLICATIONS,
} from './applicationService'

describe('applicationService', () => {
  beforeEach(() => {
    // Reset window & localStorage mocks
    const store = new Map<string, string>()
    const localStorageMock = {
      getItem: (k: string) => store.get(k) || null,
      setItem: (k: string, v: string) => {
        store.set(k, v)
      },
      removeItem: (k: string) => {
        store.delete(k)
      },
      clear: () => store.clear(),
      length: 0,
      key: () => null,
    }

    if (typeof globalThis.window === 'undefined') {
      // @ts-expect-error Mocking window in Node test runner
      globalThis.window = {
        localStorage: localStorageMock,
        dispatchEvent: () => true,
        addEventListener: () => {},
        removeEventListener: () => {},
      }
    } else {
      Object.defineProperty(globalThis.window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      })
    }

    applicationService.resetApplications()
  })

  it('retrieves initial demo applications when storage is empty', () => {
    const apps = applicationService.getApplications()
    expect(apps.length).toBe(INITIAL_DEMO_APPLICATIONS.length)
    expect(apps.some((a) => a.scholarshipId === 'sch-horizon-stem-2026')).toBe(true)
    expect(apps.some((a) => a.status === 'submitted')).toBe(true)
  })

  it('tracks a new scholarship and initializes document checklist and timeline', () => {
    const newApp = applicationService.trackScholarship('sch-global-leaders-2026', 'planning')
    expect(newApp).toBeTruthy()
    expect(newApp.scholarshipId).toBe('sch-global-leaders-2026')
    expect(newApp.status).toBe('planning')
    expect(newApp.documents.length).toBeGreaterThan(0)
    expect(newApp.timeline.length).toBe(1)
    expect(newApp.timeline[0].type).toBe('created')

    // Calling again returns the existing application without duplication
    const duplicateCheck = applicationService.trackScholarship('sch-global-leaders-2026')
    expect(duplicateCheck.id).toBe(newApp.id)
  })

  it('transitions application status and records timeline history', () => {
    const app = applicationService.trackScholarship('sch-global-leaders-2026', 'planning')
    const success = applicationService.updateStatus(
      app.id,
      'in_progress',
      'Started drafting statement of purpose.',
    )
    expect(success).toBe(true)

    const updated = applicationService.getApplication(app.id)
    expect(updated?.status).toBe('in_progress')
    expect(updated?.timeline[0].type).toBe('status_change')
    expect(updated?.timeline[0].previousStatus).toBe('planning')
    expect(updated?.timeline[0].newStatus).toBe('in_progress')
    expect(updated?.timeline[0].description).toBe('Started drafting statement of purpose.')
  })

  it('manages document checklist status and readiness percentage calculation', () => {
    const app = applicationService.getApplication('app-sch-horizon-stem-2026')
    expect(app).toBeTruthy()
    if (!app) return

    const initialReadiness = applicationService.calculateReadiness(app.documents)
    expect(initialReadiness.total).toBe(app.documents.length)
    expect(initialReadiness.ready).toBeGreaterThanOrEqual(1)

    // Mark all documents ready
    for (const doc of app.documents) {
      applicationService.updateDocumentStatus(app.id, doc.id, 'ready')
    }

    const updatedApp = applicationService.getApplication(app.id)
    const finalReadiness = applicationService.calculateReadiness(updatedApp!.documents)
    expect(finalReadiness.ready).toBe(finalReadiness.total)
    expect(finalReadiness.percentage).toBe(100)
  })

  it('adds custom document requirement to an application', () => {
    const app = applicationService.getApplication('app-sch-horizon-stem-2026')
    const initialDocCount = app!.documents.length

    const added = applicationService.addDocument(app!.id, {
      title: 'Dean Recommendation Letter',
      category: 'recommendation',
      required: true,
      status: 'not_started',
      notes: 'Must be requested via academic portal',
    })

    expect(added).toBeTruthy()
    expect(added?.title).toBe('Dean Recommendation Letter')

    const updated = applicationService.getApplication(app!.id)
    expect(updated!.documents.length).toBe(initialDocCount + 1)
    expect(updated!.timeline[0].type).toBe('document_update')
  })

  it('attaches and removes file metadata from document items', () => {
    const app = applicationService.getApplication('app-sch-horizon-stem-2026')
    const docId = app!.documents[0].id

    applicationService.attachFileToDocument(app!.id, docId, {
      name: 'transcript_scan.pdf',
      type: 'application/pdf',
      size: 512000,
      data: 'data:application/pdf;base64,mockContent',
    })

    const withFile = applicationService.getApplication(app!.id)
    const docWithFile = withFile!.documents.find((d) => d.id === docId)
    expect(docWithFile?.fileName).toBe('transcript_scan.pdf')
    expect(docWithFile?.status).toBe('ready')

    // Remove file
    applicationService.removeFileFromDocument(app!.id, docId)
    const afterRemoval = applicationService.getApplication(app!.id)
    const docAfter = afterRemoval!.documents.find((d) => d.id === docId)
    expect(docAfter?.fileName).toBeUndefined()
  })

  it('updates personal notes, confirmation code, and target dates', () => {
    const app = applicationService.getApplication('app-sch-civic-impact-2026')
    expect(app).toBeTruthy()

    applicationService.updateNotes(app!.id, 'Meeting with advisor on Thursday at 2pm.')
    applicationService.updateTargetDate(app!.id, '2026-11-18')
    applicationService.updateConfirmationReference(app!.id, 'CIVIC-REF-2026')

    const updated = applicationService.getApplication(app!.id)
    expect(updated?.notes).toBe('Meeting with advisor on Thursday at 2pm.')
    expect(updated?.targetSubmissionDate).toBe('2026-11-18')
    expect(updated?.confirmationReference).toBe('CIVIC-REF-2026')
  })

  it('untracks an application cleanly from storage', () => {
    const app = applicationService.getApplication('app-sch-civic-impact-2026')
    expect(app).toBeTruthy()

    const untracked = applicationService.untrackApplication(app!.id)
    expect(untracked).toBe(true)

    const searchAgain = applicationService.getApplication(app!.id)
    expect(searchAgain).toBeNull()
  })

  it('safely recovers when storage contains corrupted JSON', () => {
    window.localStorage.setItem(APPLICATIONS_STORAGE_KEY, 'corrupted_json{{{')
    const apps = applicationService.getApplications()
    expect(Array.isArray(apps)).toBe(true)
    expect(apps.length).toBe(INITIAL_DEMO_APPLICATIONS.length)
  })
})
