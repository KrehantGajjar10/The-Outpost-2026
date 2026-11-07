import type { DashboardNotification } from '../types/dashboard'

export const INITIAL_DEMO_NOTIFICATIONS: DashboardNotification[] = [
  {
    id: 'notif-1',
    title: 'Horizon STEM Grant: 7 Days Remaining',
    description: 'Final application deadline is Nov 14, 2026. Make sure to upload your GitHub portfolio link.',
    timestamp: '2 hours ago',
    read: false,
    urgency: 'high',
    relatedScholarshipId: 'sch-horizon-stem-2026',
  },
  {
    id: 'notif-2',
    title: 'Recommendation Letter Received',
    description: 'Dr. Aris Thorne submitted their recommendation letter for the Civic Impact Fellowship.',
    timestamp: 'Yesterday',
    read: false,
    urgency: 'info',
    relatedScholarshipId: 'sch-civic-impact-2026',
  },
  {
    id: 'notif-3',
    title: 'Matching Update: 2 New Matches',
    description: 'Your profile matches 2 newly added undergraduate opportunities based on your 3.84 GPA.',
    timestamp: '3 days ago',
    read: true,
    urgency: 'medium',
  },
]
