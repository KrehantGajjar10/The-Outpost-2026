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
  it('correctly normalizes compatible academic score scales and rejects none', () => {
    expect(normalizeScoreToPercentage(4.0, 'gpa_4')).toBe(100)
    expect(normalizeScoreToPercentage(3.0, 'gpa_4')).toBe(75)
    expect(normalizeScoreToPercentage(4.5, 'gpa_5')).toBe(90)
    expect(normalizeScoreToPercentage(85, 'percentage')).toBe(85)
    expect(normalizeScoreToPercentage(0, 'none')).toBeNull()
    expect(normalizeScoreToPercentage(3.5, 'none')).toBeNull()
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

  // REGRESSION TEST 1: Independent Residency and Nationality restrictions
  it('evaluates residency and nationality independently (matching residency does NOT bypass nationality restriction)', () => {
    const ukCitizenOnlyInCanada: Scholarship = {
      ...globalStemScholarship,
      eligibleCountries: ['Canada'], // Matches Elena's residency
      nationalityRequirements: ['British'], // Elena is Canadian -> MUST FAIL!
    }
    const assessment = assessEligibility(ukCitizenOnlyInCanada, sampleProfile)
    expect(assessment.status).toBe('not_eligible')
    expect(assessment.satisfiedCriteria.some((c) => c.id === 'residence-check')).toBe(true)
    expect(assessment.failedCriteria.some((c) => c.id === 'nationality-check')).toBe(true)
  })

  it('evaluates residency and nationality independently (matching nationality does NOT bypass residency restriction)', () => {
    const canadianLivingInGermanyOnly: Scholarship = {
      ...globalStemScholarship,
      eligibleCountries: ['Germany'], // Elena lives in Canada -> MUST FAIL!
      nationalityRequirements: ['Canadian'], // Matches Elena's nationality
    }
    const assessment = assessEligibility(canadianLivingInGermanyOnly, sampleProfile)
    expect(assessment.status).toBe('not_eligible')
    expect(assessment.failedCriteria.some((c) => c.id === 'residence-check')).toBe(true)
    expect(assessment.satisfiedCriteria.some((c) => c.id === 'nationality-check')).toBe(true)
  })

  // REGRESSION TEST 2: Tri-State handling for financial need
  it('handles tri-state financial need: true is satisfied, false is failed, undefined is missing_info', () => {
    const needScholarship: Scholarship = {
      ...globalStemScholarship,
      financialRequirement: {
        requiresNeed: true,
        description: 'Must demonstrate financial hardship',
      },
    }

    // 1. Explicit true -> satisfied
    const resTrue = assessEligibility(needScholarship, { ...sampleProfile, financialNeed: true })
    expect(resTrue.satisfiedCriteria.some((c) => c.id === 'financial-need')).toBe(true)
    expect(resTrue.failedCriteria.some((c) => c.id === 'financial-need')).toBe(false)

    // 2. Explicit false -> failed
    const resFalse = assessEligibility(needScholarship, { ...sampleProfile, financialNeed: false })
    expect(resFalse.failedCriteria.some((c) => c.id === 'financial-need')).toBe(true)
    expect(resFalse.status).toBe('not_eligible')

    // 3. Undefined / unknown -> missing_info
    const resUndefined = assessEligibility(needScholarship, {
      ...sampleProfile,
      financialNeed: undefined as unknown as boolean,
    })
    expect(resUndefined.missingInformation.some((c) => c.id === 'financial-need')).toBe(true)
    expect(resUndefined.failedCriteria.some((c) => c.id === 'financial-need')).toBe(false)
    expect(resUndefined.status).toBe('potential_match')
  })

  // REGRESSION TEST 3: Tri-State handling for first generation
  it('handles tri-state first generation: true is satisfied, false is failed, undefined is missing_info', () => {
    const firstGenScholarship: Scholarship = {
      ...globalStemScholarship,
      requiresFirstGen: true,
    }

    // 1. Explicit true -> satisfied
    const resTrue = assessEligibility(firstGenScholarship, { ...sampleProfile, firstGeneration: true })
    expect(resTrue.satisfiedCriteria.some((c) => c.id === 'first-gen')).toBe(true)

    // 2. Explicit false -> failed
    const resFalse = assessEligibility(firstGenScholarship, { ...sampleProfile, firstGeneration: false })
    expect(resFalse.failedCriteria.some((c) => c.id === 'first-gen')).toBe(true)
    expect(resFalse.status).toBe('not_eligible')

    // 3. Undefined / unknown -> missing_info
    const resUndefined = assessEligibility(firstGenScholarship, {
      ...sampleProfile,
      firstGeneration: undefined as unknown as boolean,
    })
    expect(resUndefined.missingInformation.some((c) => c.id === 'first-gen')).toBe(true)
    expect(resUndefined.status).toBe('potential_match')
  })

  // REGRESSION TEST 4: Handle 'none' grading scale explicitly without artificial conversion
  it('handles none grading scale explicitly without converting to artificial GPA or percentage', () => {
    const noneScaleProfile: StudentProfile = {
      ...sampleProfile,
      academicScore: {
        value: 0,
        scale: 'none',
        label: 'Ungraded Coursework',
      },
    }
    const assessment = assessEligibility(globalStemScholarship, noneScaleProfile)
    expect(assessment.status).toBe('potential_match')
    const scoreItem = assessment.missingInformation.find((m) => m.type === 'academic_score')
    expect(scoreItem).toBeDefined()
    expect(scoreItem?.message).toContain('non-numerical grading system ("None")')
  })

  // REGRESSION TEST 5: Comparing incompatible grading scales requests manual verification
  it('marks incompatible grading scales as missing_info for manual verification rather than assuming universal conversion', () => {
    const percentageProfile: StudentProfile = {
      ...sampleProfile,
      academicScore: {
        value: 88,
        scale: 'percentage',
        label: '88%',
      },
    }
    // Scholarship strictly specifies gpa_4
    const assessment = assessEligibility(globalStemScholarship, percentageProfile)
    expect(assessment.status).toBe('potential_match')
    const scoreItem = assessment.missingInformation.find((m) => m.id === 'academic-score')
    expect(scoreItem).toBeDefined()
    expect(scoreItem?.message).toContain('Grading scale mismatch')
  })

  // REGRESSION TEST 6: Optional study destination failure does not produce contradictory strong match
  it('ensures optional study destination failure produces potential_match rather than contradictory strong match', () => {
    const swedenOnlyDestination: Scholarship = {
      ...globalStemScholarship,
      eligibleDestinations: ['Sweden'], // Elena's preferred destinations are Canada & Germany
    }
    const assessment = assessEligibility(swedenOnlyDestination, sampleProfile)
    expect(assessment.status).toBe('potential_match')
    expect(assessment.failedCriteria.some((c) => c.id === 'destination' && !c.isMandatory)).toBe(true)
    expect(assessment.matchScore).toBeLessThan(90)
    expect(assessment.summaryRationale).toContain('optional preferences')
  })
})
