export type ApplicationStatus =
  | 'planning'
  | 'in_progress'
  | 'submitted'
  | 'under_review'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'

export type DocumentStatus = 'not_started' | 'in_progress' | 'ready'

export type DocumentCategory =
  | 'transcript'
  | 'enrollment'
  | 'resume'
  | 'recommendation'
  | 'essay'
  | 'portfolio'
  | 'financial'
  | 'test_score'
  | 'custom'

export interface ApplicationDocument {
  id: string
  title: string
  category: DocumentCategory
  status: DocumentStatus
  required: boolean
  notes?: string
  fileName?: string
  fileSize?: number
  fileType?: string
  fileData?: string // Base64 data or mock identifier for local preview
  uploadedAt?: string
  updatedAt: string
}

export type TimelineEventType =
  | 'status_change'
  | 'document_update'
  | 'note_added'
  | 'target_date_set'
  | 'created'

export interface ApplicationTimelineEvent {
  id: string
  type: TimelineEventType
  title: string
  description: string
  timestamp: string // ISO string
  previousStatus?: ApplicationStatus
  newStatus?: ApplicationStatus
}

export interface TrackedApplication {
  id: string
  scholarshipId: string
  status: ApplicationStatus
  customStageLabel?: string
  documents: ApplicationDocument[]
  notes: string
  targetSubmissionDate?: string // ISO string YYYY-MM-DD
  confirmationReference?: string
  officialPortalUrl?: string
  createdAt: string // ISO string
  updatedAt: string // ISO string
  timeline: ApplicationTimelineEvent[]
}

export interface ApplicationFilterState {
  searchQuery: string
  status: 'all' | ApplicationStatus
  urgency: 'all' | 'overdue' | 'urgent' | 'approaching' | 'normal'
  sortBy: 'deadline_asc' | 'deadline_desc' | 'updated_desc' | 'amount_desc' | 'title_asc'
}

export interface ApplicationMetrics {
  totalTracked: number
  inProgressCount: number
  submittedCount: number
  underReviewCount: number
  acceptedCount: number
  planningCount: number
  overdueCount: number
  approachingCount: number // within 7 days
  totalPotentialFundingUSD: number
}
