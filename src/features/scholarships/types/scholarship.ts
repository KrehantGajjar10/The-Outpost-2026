export type ScholarshipCategory =
  | 'stem'
  | 'humanities'
  | 'community'
  | 'first-gen'
  | 'merit'
  | 'need-based'

export type ScholarshipStatus =
  | 'recommended'
  | 'saved'
  | 'in_progress'
  | 'submitted'
  | 'awarded'

export type UrgencyLevel = 'urgent' | 'upcoming' | 'normal'

export interface ScholarshipRequirement {
  id: string
  label: string
  completed: boolean
}

export interface Scholarship {
  id: string
  title: string
  provider: string
  organizationType: 'Foundation' | 'Nonprofit' | 'Corporate' | 'Institutional'
  amount: number
  amountFormatted: string
  isRenewable: boolean
  renewalTerms?: string
  deadline: string // ISO date string YYYY-MM-DD
  daysRemaining: number
  category: ScholarshipCategory
  categoryLabel: string
  academicLevel: string
  minGpa: number
  citizenshipRequirement: string
  description: string
  requirements: ScholarshipRequirement[]
  essayPrompt?: string
  matchScore: number
  status: ScholarshipStatus
  urgency: UrgencyLevel
  currentStage?: string
  disbursementSchedule: string
  isSampleData: true
}
