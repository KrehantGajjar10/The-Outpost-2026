import { describe, it, expect } from 'vitest'
import { assessEligibility, normalizeScoreToPercentage } from './eligibilityEngine'
import type { Scholarship } from '../../scholarships/types/scholarship'
import type { StudentProfile } from '../../profile/types/profile'

const sampleProfile: StudentProfile = {
  id: 'test-student',
  fullName: 'Elena Rostova',
  preferredName: 'Elena',
  countryOfResidence: 'Canada',
  nationality: 'Canadian',
  preferredStudyDestinations: ['Canada', 'Germany'],
  currentInstitution: 'Pacific Coast University',
  educationLevel: 'undergraduate',
  fieldOfStudy: 'Computer Science',
  academicScore: {
    value: 3.84,
    scale: 'gpa_4',
    label: '3.84 / 4.0',
  },
  financialNeed: true,
  firstGeneration: true,
  demonstrationProfile: true,
}

const globalStemScholarship: Scholarship = {
  id: 'sch-global-stem',
  title: 'Global Computing Fellowship',
  provider: 'Future Tech Alliance',
  organizationType: 'Nonprofit',
  shortDescription: 'Global computing grant for undergraduates.',
  detailedDescription: 'Full detailed description here.',
  fundingAmount: 10000,
  currency: 'USD',
  formattedAmount: '$10,000',
  awardType: 'annual',
  deadline: '2026-12-15',
  eligibleCountries: ['GLOBAL'],
  eligibleDestinations: ['GLOBAL'],
  nationalityRequirements: ['ANY'],
  educationLevels: ['undergraduate'],
  fieldsOfStudy: ['Computer Science', 'Data Science'],
  academicRequirement: {
    minScore: 3.5,
    scale: 'gpa_4',
    description: 'Minimum 3.5 Cumulative GPA',
  },
  requiredDocuments: ['Transcript', 'Essay'],
  applicationInstructions: 'Apply online',
  disbursementSchedule: 'Annual',
  tags: ['STEM', 'Tech'],
  category: 'stem',
  categoryLabel: 'STEM & Computing',
  isSampleData: true,
}

describe('eligibilityEngine', () => {
  it('correctly normalizes different academic score scales', () => {
    expect(normalizeScoreToPercentage(4.0, 'gpa_4')).toBe(100)
    expect(normalizeScoreToPercentage(3.0, 'gpa_4')).toBe(75)
    expect(normalizeScoreToPercentage(4.5, 'gpa_5')).toBe(90)
    expect(normalizeScoreToPercentage(85, 'percentage')).toBe(85)
  })

  it('evaluates a strong match when all mandatory requirements are satisfied', () => {
    const assessment = assessEligibility(globalStemScholarship, sampleProfile)
    expect(assessment.status).toBe('strong_match')
    expect(assessment.failedCriteria.length).toBe(0)
    expect(assessment.missingInformation.length).toBe(0)
    expect(assessment.matchScore).toBeGreaterThanOrEqual(90)
  })

  it('evaluates not_eligible and caps match score when mandatory requirement fails', () => {
    const graduateScholarship: Scholarship = {
      ...globalStemScholarship,
      educationLevels: ['masters', 'doctorate'],
    }
    const assessment = assessEligibility(graduateScholarship, sampleProfile)
    expect(assessment.status).toBe('not_eligible')
    expect(assessment.failedCriteria.some((c) => c.isMandatory && c.type === 'education_level')).toBe(true)
    // Mandatory failure must never yield a high score
    expect(assessment.matchScore).toBeLessThanOrEqual(30)
  })

  it('evaluates not_eligible when academic GPA falls below required cutoff', () => {
    const highGpaScholarship: Scholarship = {
      ...globalStemScholarship,
      academicRequirement: {
        minScore: 3.95,
        scale: 'gpa_4',
        description: 'Minimum 3.95 Cumulative GPA',
      },
    }
    const assessment = assessEligibility(highGpaScholarship, sampleProfile)
    expect(assessment.status).toBe('not_eligible')
    expect(assessment.failedCriteria.some((c) => c.type === 'academic_score')).toBe(true)
  })

  it('evaluates potential_match when mandatory info is missing from profile', () => {
    const incompleteProfile: StudentProfile = {
      ...sampleProfile,
      fieldOfStudy: '', // Missing major
    }
    const assessment = assessEligibility(globalStemScholarship, incompleteProfile)
    expect(assessment.status).toBe('potential_match')
    expect(assessment.missingInformation.some((m) => m.type === 'field_of_study')).toBe(true)
  })

  it('identifies country and residency restrictions correctly', () => {
    const ukOnlyScholarship: Scholarship = {
      ...globalStemScholarship,
      eligibleCountries: ['United Kingdom'],
      nationalityRequirements: ['British'],
    }
    const assessment = assessEligibility(ukOnlyScholarship, sampleProfile)
    expect(assessment.status).toBe('not_eligible')
    expect(assessment.failedCriteria.some((c) => c.type === 'residence_or_nationality')).toBe(true)
  })

  it('handles need-based requirement evaluation', () => {
    const needScholarship: Scholarship = {
      ...globalStemScholarship,
      financialRequirement: {
        requiresNeed: true,
        description: 'Must demonstrate financial hardship',
      },
    }
    const assessmentNeedMet = assessEligibility(needScholarship, sampleProfile)
    expect(assessmentNeedMet.status).toBe('strong_match')

    const assessmentNoNeed = assessEligibility(needScholarship, {
      ...sampleProfile,
      financialNeed: false,
    })
    expect(assessmentNoNeed.status).toBe('not_eligible')
    expect(assessmentNoNeed.failedCriteria.some((c) => c.type === 'financial_need')).toBe(true)
  })
})
