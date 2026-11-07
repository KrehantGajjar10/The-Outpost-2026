import type { EducationLevel } from '../../scholarships/types/scholarship'

export type AcademicScoreScale = 'gpa_4' | 'gpa_5' | 'percentage' | 'uk_honours' | 'none'

export interface AcademicScore {
  value: number
  scale: AcademicScoreScale
  label?: string // e.g. "3.84 / 4.0" or "88%" or "First Class Honours"
}

export interface StudentProfile {
  id: string
  fullName: string
  preferredName: string
  email?: string
  countryOfResidence: string // e.g. "Canada", "Germany", "India", "United States", "Nigeria", "Singapore"
  nationality: string // e.g. "Canadian", "German", "Indian", "American", "Nigerian", "Singaporean"
  stateOrProvince?: string
  preferredStudyDestinations: string[] // e.g. ["Germany", "United Kingdom", "Canada"]
  currentInstitution: string
  educationLevel: EducationLevel
  academicYear?: string // e.g. "Year 3", "Final Year", "Graduate Year 1"
  fieldOfStudy: string // e.g. "Computer Science & Public Policy", "Mechanical Engineering", "Biomedical Sciences"
  academicScore: AcademicScore
  financialNeed: boolean
  firstGeneration: boolean
  demonstrationProfile: boolean
}
