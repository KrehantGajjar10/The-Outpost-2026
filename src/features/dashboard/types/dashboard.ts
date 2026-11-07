import type { ScholarshipCategory, ScholarshipStatus } from '../../scholarships/types/scholarship'

export interface StudentProfile {
  id: string
  fullName: string
  preferredName: string
  role: string
  major: string
  minor?: string
  institution: string
  academicStanding: string
  gpa: number
  totalTargetFunding: number
  demonstrationProfile: true
}

export interface DashboardMetrics {
  totalSaved: number
  inProgressCount: number
  upcomingDeadlinesCount: number
  totalPotentialFunding: number
  formattedPotentialFunding: string
  nearestDeadlineDays: number
  nearestScholarshipTitle: string
}

export interface DashboardNotification {
  id: string
  title: string
  description: string
  timestamp: string
  read: boolean
  urgency: 'high' | 'medium' | 'info'
  relatedScholarshipId?: string
}

export interface ScholarshipFilters {
  searchQuery: string
  category: 'all' | ScholarshipCategory
  status: 'all' | ScholarshipStatus
  urgency: 'all' | 'urgent' | 'upcoming'
}
