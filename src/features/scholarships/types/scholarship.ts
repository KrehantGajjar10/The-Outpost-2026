import type { UrgencyLevel } from '../../../lib/utils'
export type { UrgencyLevel }

export type EducationLevel =
  | 'high_school'
  | 'undergraduate'
  | 'masters'
  | 'doctorate'
  | 'vocational'

export type AwardType = 'one_time' | 'annual' | 'renewable' | 'full_tuition'

export type ScholarshipCategory =
  | 'stem'
  | 'humanities'
  | 'community'
  | 'first-gen'
  | 'merit'
  | 'need-based'
  | 'arts'
  | 'healthcare'
  | 'business'

export type ScholarshipStatus = 'recommended' | 'saved' | 'in_progress' | 'submitted' | 'awarded'

export type OrganizationType =
  | 'Foundation'
  | 'Nonprofit'
  | 'Corporate'
  | 'Institutional'
  | 'Government'

export interface AcademicRequirement {
  minScore?: number
  scale?: 'gpa_4' | 'gpa_5' | 'percentage' | 'none'
  description: string
}

export interface FinancialRequirement {
  requiresNeed: boolean
  description: string
}

export interface ScholarshipRequirementItem {
  id: string
  label: string
  completed?: boolean
}

export interface Scholarship {
  id: string
  title: string
  provider: string
  organizationType: OrganizationType
  shortDescription: string
  detailedDescription: string
  fundingAmount: number
  currency: string // ISO 4217, e.g. 'USD', 'EUR', 'GBP', 'CAD', 'INR', 'SGD'
  formattedAmount: string
  awardType: AwardType
  renewableDurationYears?: number
  renewalTerms?: string
  deadline: string // ISO string 'YYYY-MM-DD'
  eligibleCountries: string[] // Country names or ['GLOBAL']
  eligibleDestinations: string[] // Destination countries or ['GLOBAL']
  nationalityRequirements: string[] // Nationalities or ['ANY']
  educationLevels: EducationLevel[]
  fieldsOfStudy: string[] // Specific fields or ['ALL']
  academicRequirement: AcademicRequirement
  financialRequirement?: FinancialRequirement
  requiresFirstGen?: boolean
  requiredDocuments: string[]
  applicationInstructions: string
  disbursementSchedule: string
  tags: string[]
  category: ScholarshipCategory
  categoryLabel: string
  isSampleData: true

  // Dynamic/pipeline fields
  isSaved?: boolean
  daysRemaining?: number
  urgency?: UrgencyLevel

  // Legacy compatibility fields if needed by existing components
  amount?: number
  amountFormatted?: string
  minGpa?: number
  isRenewable?: boolean
  academicLevel?: string
  description?: string
  citizenshipRequirement?: string
  requirements?: ScholarshipRequirementItem[]
  essayPrompt?: string
  currentStage?: string
  status?: ScholarshipStatus
  matchScore?: number
}
