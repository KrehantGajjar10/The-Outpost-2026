export type EligibilityStatus = 'strong_match' | 'potential_match' | 'not_eligible'

export type CriterionType =
  | 'residence_or_nationality'
  | 'study_destination'
  | 'education_level'
  | 'field_of_study'
  | 'academic_score'
  | 'financial_need'
  | 'first_generation'

export interface EligibilityCriterionResult {
  id: string
  type: CriterionType
  label: string
  status: 'satisfied' | 'failed' | 'missing_info'
  isMandatory: boolean
  message: string
  studentValue?: string
  requiredValue?: string
}

export interface EligibilityAssessment {
  scholarshipId: string
  status: EligibilityStatus
  matchScore: number // 0-100 percentage
  satisfiedCriteria: EligibilityCriterionResult[]
  failedCriteria: EligibilityCriterionResult[]
  missingInformation: EligibilityCriterionResult[]
  summaryRationale: string
  isEstimateNotice: string
}
