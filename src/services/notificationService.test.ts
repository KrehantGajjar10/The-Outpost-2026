import { describe, it, expect, beforeEach } from 'vitest'
import {
  notificationService,
  INITIAL_NOTIFICATIONS,
  NOTIFICATIONS_STORAGE_KEY,
} from './notificationService'
import type { TrackedApplication } from '../features/applications/types/application'

describe('notificationService', () => {
  beforeEach(() => {
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

    notificationService.resetNotifications()
  })

  it('retrieves default notifications on initial load', () => {
    const list = notificationService.getNotifications()
    expect(list.length).toBe(INITIAL_NOTIFICATIONS.length)
    expect(list[0].id).toBeTruthy()
    expect(list[0].title).toBeTruthy()
  })

  it('marks a single notification as read', () => {
    const list = notificationService.getNotifications()
    const target = list.find((n) => !n.read)
    expect(target).toBeTruthy()

    notificationService.markAsRead(target!.id)
    const updated = notificationService.getNotifications()
    const found = updated.find((n) => n.id === target!.id)
    expect(found?.read).toBe(true)
  })

  it('marks all notifications as read', () => {
    notificationService.markAllAsRead()
    const list = notificationService.getNotifications()
    expect(list.every((n) => n.read)).toBe(true)
  })

  it('prevents duplicate notifications with the same ID', () => {
    const first = notificationService.addNotification({
      id: 'custom-unique-id',
      title: 'Interview Scheduled',
      description: 'Your interview is scheduled for Friday.',
      urgency: 'info',
    })
    expect(first).toBeTruthy()

    const duplicate = notificationService.addNotification({
      id: 'custom-unique-id',
      title: 'Interview Scheduled',
      description: 'Duplicate attempt.',
      urgency: 'info',
    })
    expect(duplicate).toBeNull()
  })

  it('synchronizes deadline notifications and handles overdue/urgent deadlines', () => {
    // Generate dates relative to now to be date-independent
    const now = new Date()
    const overdueDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const urgentDate = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

    const mockApps: TrackedApplication[] = [
      {
        id: 'app-test-overdue',
        scholarshipId: 'sch-horizon-stem-2026',
        status: 'in_progress',
        targetSubmissionDate: overdueDate,
        notes: '',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        documents: [],
        timeline: [],
      },
      {
        id: 'app-test-urgent',
        scholarshipId: 'sch-civic-impact-2026',
        status: 'planning',
        targetSubmissionDate: urgentDate,
        notes: '',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        documents: [],
        timeline: [],
      },
      {
        id: 'app-test-submitted',
        scholarshipId: 'sch-nordic-sustainability-2026',
        status: 'submitted', // should be ignored for deadline warnings
        targetSubmissionDate: overdueDate,
        notes: '',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        documents: [],
        timeline: [],
      },
    ]

    notificationService.syncDeadlineNotifications(mockApps)
    const list = notificationService.getNotifications()

    expect(list.some((n) => n.id === 'notif-overdue-app-test-overdue')).toBe(true)
    expect(list.some((n) => n.id === 'notif-urgent-7d-app-test-urgent')).toBe(true)
    expect(list.some((n) => n.id === 'notif-overdue-app-test-submitted')).toBe(false)

    // Running again does not create duplicate entries
    const lengthBefore = list.length
    notificationService.syncDeadlineNotifications(mockApps)
    const lengthAfter = notificationService.getNotifications().length
    expect(lengthAfter).toBe(lengthBefore)
  })

  it('safely recovers when storage contains malformed JSON', () => {
    window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, 'invalid_json{{')
    const list = notificationService.getNotifications()
    expect(Array.isArray(list)).toBe(true)
    expect(list.length).toBe(INITIAL_NOTIFICATIONS.length)
  })
})
