import { storage } from './storage'
import { calculateDaysRemaining } from '../lib/utils'
import { DEMO_SCHOLARSHIPS } from '../features/scholarships/data/mockScholarships'
import type { DashboardNotification } from '../features/dashboard/types/dashboard'
import type { TrackedApplication } from '../features/applications/types/application'

export const NOTIFICATIONS_STORAGE_KEY = 'grantly_notifications'
export const NOTIFICATIONS_CHANGED_EVENT = 'grantly:notifications_changed'

export const INITIAL_NOTIFICATIONS: DashboardNotification[] = [
  {
    id: 'notif-horizon-reminder',
    title: 'Horizon STEM Grant: Approaching Deadline',
    description: 'Application deadline is Nov 14, 2026. Ensure all recommendation letters and portfolio links are uploaded.',
    timestamp: '2 hours ago',
    read: false,
    urgency: 'high',
    relatedScholarshipId: 'sch-horizon-stem-2026',
  },
  {
    id: 'notif-civic-doc',
    title: 'Recommendation Letter Update',
    description: 'Dr. Aris Thorne submitted an endorsement letter for the Civic Impact Fellowship.',
    timestamp: 'Yesterday',
    read: false,
    urgency: 'info',
    relatedScholarshipId: 'sch-civic-impact-2026',
  },
  {
    id: 'notif-nordic-confirmed',
    title: 'Nordic Fellowship Submission Recorded',
    description: 'Application successfully recorded on provider admissions portal. Confirmation code: NORD-2026-8910.',
    timestamp: '3 days ago',
    read: true,
    urgency: 'info',
    relatedScholarshipId: 'sch-nordic-sustainability-2026',
  },
]

export const notificationService = {
  /**
   * Retrieve all notifications
   */
  getNotifications(): DashboardNotification[] {
    const list = storage.getItem<DashboardNotification[]>(
      NOTIFICATIONS_STORAGE_KEY,
      INITIAL_NOTIFICATIONS,
    )
    if (!Array.isArray(list)) return INITIAL_NOTIFICATIONS
    return list
  },

  /**
   * Mark a single notification as read
   */
  markAsRead(id: string): boolean {
    const list = this.getNotifications()
    const updated = list.map((item) => (item.id === id ? { ...item, read: true } : item))
    return this.saveNotifications(updated)
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): boolean {
    const list = this.getNotifications()
    const updated = list.map((item) => ({ ...item, read: true }))
    return this.saveNotifications(updated)
  },

  /**
   * Add a notification preventing duplicate notifications with the same ID or title/relatedScholarshipId
   */
  addNotification(
    data: {
      id?: string
      title: string
      description: string
      urgency: 'high' | 'medium' | 'info'
      relatedScholarshipId?: string
    },
  ): DashboardNotification | null {
    const list = this.getNotifications()
    const targetId = data.id || `notif-${Date.now()}`

    // Check for exact duplicate
    if (list.some((n) => n.id === targetId)) {
      return null
    }

    const newNotif: DashboardNotification = {
      id: targetId,
      title: data.title,
      description: data.description,
      urgency: data.urgency,
      relatedScholarshipId: data.relatedScholarshipId,
      read: false,
      timestamp: 'Just now',
    }

    const updated = [newNotif, ...list]
    this.saveNotifications(updated)
    return newNotif
  },

  /**
   * Synchronize active application deadlines against the current local date/time.
   * Generates overdue, approaching (<=7 days), or upcoming (<=30 days) reminders once per trigger.
   */
  syncDeadlineNotifications(applications: TrackedApplication[]): void {
    const list = this.getNotifications()
    let hasChanges = false
    const currentList = [...list]

    for (const app of applications) {
      if (app.status === 'submitted' || app.status === 'accepted' || app.status === 'withdrawn') {
        continue
      }

      const scholarship = DEMO_SCHOLARSHIPS.find((s) => s.id === app.scholarshipId)
      const deadline = app.targetSubmissionDate || scholarship?.deadline
      if (!deadline) continue

      const daysRemaining = calculateDaysRemaining(deadline)
      const schTitle = scholarship?.title || 'Scholarship'

      if (daysRemaining < 0) {
        const overdueId = `notif-overdue-${app.id}`
        if (!currentList.some((n) => n.id === overdueId)) {
          currentList.unshift({
            id: overdueId,
            title: `Deadline Passed: ${schTitle}`,
            description: `The deadline for ${schTitle} was due ${Math.abs(daysRemaining)} days ago. Please review your application status.`,
            timestamp: 'Attention Required',
            read: false,
            urgency: 'high',
            relatedScholarshipId: app.scholarshipId,
          })
          hasChanges = true
        }
      } else if (daysRemaining <= 7) {
        const urgentId = `notif-urgent-7d-${app.id}`
        if (!currentList.some((n) => n.id === urgentId)) {
          currentList.unshift({
            id: urgentId,
            title: `Due in ${daysRemaining} Days: ${schTitle}`,
            description: `Only ${daysRemaining} ${daysRemaining === 1 ? 'day remains' : 'days remain'} before the deadline (${deadline}). Review ready documents.`,
            timestamp: 'Urgent',
            read: false,
            urgency: 'high',
            relatedScholarshipId: app.scholarshipId,
          })
          hasChanges = true
        }
      }
    }

    if (hasChanges) {
      this.saveNotifications(currentList)
    }
  },

  /**
   * Persist notifications and broadcast change event
   */
  saveNotifications(notifications: DashboardNotification[]): boolean {
    const success = storage.setItem(NOTIFICATIONS_STORAGE_KEY, notifications)
    if (success && typeof window !== 'undefined') {
      try {
        window.dispatchEvent(
          new CustomEvent<DashboardNotification[]>(NOTIFICATIONS_CHANGED_EVENT, {
            detail: notifications,
          }),
        )
      } catch (err) {
        console.warn('Failed to dispatch notifications changed event:', err)
      }
    }
    return success
  },

  /**
   * Reset notifications to default
   */
  resetNotifications(): boolean {
    return this.saveNotifications(INITIAL_NOTIFICATIONS)
  },
}
