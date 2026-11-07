import type { Scholarship } from '../../scholarships/types/scholarship'
import type { StudentProfile } from '../../profile/types/profile'
import type {
  EligibilityAssessment,
  EligibilityCriterionResult,
  EligibilityStatus,
} from '../types/eligibility'

/**
 * Normalizes academic scores to an estimated 0-100 scale for comparison
 * across different international grading systems (GPA 4.0, GPA 5.0, Percentage).
 */
export function normalizeScoreToPercentage(value: number, scale: string): number {
  if (!value || isNaN(value)) return 0
  switch (scale) {
    case 'gpa_4':
      // 4.0 scale: 4.0 -> 100%, 3.0 -> 75%, 2.0 -> 50%
      return Math.min(100, Math.round((value / 4.0) * 100))
    case 'gpa_5':
      return Math.min(100, Math.round((value / 5.0) * 100))
    case 'percentage':
      return Math.min(100, Math.max(0, value))
    default:
      return value > 10 ? Math.min(100, value) : Math.min(100, value * 25)
  }
}

/**
 * Pure, deterministic evaluation of a scholarship against student profile data.
 * Does not make external network calls or hallucinate AI determinations.
 */
export function assessEligibility(
  scholarship: Scholarship,
  profile: StudentProfile | null | undefined,
): EligibilityAssessment {
  const isEstimateNotice =
    'Informational estimate based on self-reported profile data. Does not guarantee scholarship selection.'

  // If no profile is available, return potential match requesting profile completion
  if (!profile) {
    return {
      scholarshipId: scholarship.id,
      status: 'potential_match',
      matchScore: 50,
      satisfiedCriteria: [],
      failedCriteria: [],
      missingInformation: [
        {
          id: 'missing-profile',
          type: 'residence_or_nationality',
          label: 'Student Profile Needed',
          status: 'missing_info',
          isMandatory: true,
          message: 'Complete your student profile to evaluate eligibility for this opportunity.',
        },
      ],
      summaryRationale: 'Profile information is needed to determine eligibility.',
      isEstimateNotice,
    }
  }

  const satisfiedCriteria: EligibilityCriterionResult[] = []
  const failedCriteria: EligibilityCriterionResult[] = []
  const missingInformation: EligibilityCriterionResult[] = []

  const eligibleCountries = scholarship.eligibleCountries ?? ['GLOBAL']
  const nationalityRequirements = scholarship.nationalityRequirements ?? ['ANY']
  const educationLevels = scholarship.educationLevels ?? []
  const fieldsOfStudy = scholarship.fieldsOfStudy ?? ['ALL']
  const eligibleDestinations = scholarship.eligibleDestinations ?? ['GLOBAL']

  // 1. Residence or Nationality Check (Mandatory)
  const isGlobalCountry =
    eligibleCountries.includes('GLOBAL') ||
    eligibleCountries.length === 0
  const isAnyNationality =
    nationalityRequirements.includes('ANY') ||
    nationalityRequirements.length === 0

  if (isGlobalCountry && isAnyNationality) {
    satisfiedCriteria.push({
      id: 'residence',
      type: 'residence_or_nationality',
      label: 'Geographic Eligibility',
      status: 'satisfied',
      isMandatory: true,
      message: 'Open to applicants globally without nationality or residency restrictions.',
      studentValue: `${profile.countryOfResidence} (${profile.nationality})`,
      requiredValue: 'Global / All Nationalities',
    })
  } else {
    const hasResidenceInfo = Boolean(profile.countryOfResidence?.trim())
    const hasNationalityInfo = Boolean(profile.nationality?.trim())

    if (!hasResidenceInfo && !hasNationalityInfo) {
      missingInformation.push({
        id: 'residence',
        type: 'residence_or_nationality',
        label: 'Residency / Nationality Confirmation',
        status: 'missing_info',
        isMandatory: true,
        message: 'Add your country of residence or nationality to verify geographic qualification.',
        requiredValue: eligibleCountries.join(', '),
      })
    } else {
      const countryMatches =
        isGlobalCountry ||
        eligibleCountries.some(
          (c) => c.toLowerCase() === profile.countryOfResidence?.toLowerCase(),
        )

      const nationalityMatches =
        isAnyNationality ||
        nationalityRequirements.some(
          (n) => n.toLowerCase() === profile.nationality?.toLowerCase(),
        )

      if (countryMatches || nationalityMatches) {
        satisfiedCriteria.push({
          id: 'residence',
          type: 'residence_or_nationality',
          label: 'Geographic Eligibility',
          status: 'satisfied',
          isMandatory: true,
          message: `Your residency in ${profile.countryOfResidence} / nationality (${profile.nationality}) satisfies geographic requirements.`,
          studentValue: `${profile.countryOfResidence} (${profile.nationality})`,
          requiredValue: eligibleCountries.join(', '),
        })
      } else {
        failedCriteria.push({
          id: 'residence',
          type: 'residence_or_nationality',
          label: 'Geographic Eligibility',
          status: 'failed',
          isMandatory: true,
          message: `Applicant from ${profile.countryOfResidence} does not match eligible regions (${eligibleCountries.join(', ')}).`,
          studentValue: profile.countryOfResidence,
          requiredValue: eligibleCountries.join(', '),
        })
      }
    }
  }

  // 2. Education Level Check (Mandatory)
  if (educationLevels.length > 0) {
    if (!profile.educationLevel) {
      missingInformation.push({
        id: 'education-level',
        type: 'education_level',
        label: 'Study Level',
        status: 'missing_info',
        isMandatory: true,
        message: 'Specify your current education level to assess degree requirement.',
        requiredValue: educationLevels.join(', '),
      })
    } else if (educationLevels.includes(profile.educationLevel)) {
      satisfiedCriteria.push({
        id: 'education-level',
        type: 'education_level',
        label: 'Study Level',
        status: 'satisfied',
        isMandatory: true,
        message: `Your education level (${profile.educationLevel}) matches the target qualification level.`,
        studentValue: profile.educationLevel,
        requiredValue: educationLevels.join(', '),
      })
    } else {
      failedCriteria.push({
        id: 'education-level',
        type: 'education_level',
        label: 'Study Level',
        status: 'failed',
        isMandatory: true,
        message: `Current education level (${profile.educationLevel}) does not match target requirements (${educationLevels.join(', ')}).`,
        studentValue: profile.educationLevel,
        requiredValue: educationLevels.join(', '),
      })
    }
  }

  // 3. Field of Study Check (Mandatory)
  const isAllFields =
    fieldsOfStudy.includes('ALL') || fieldsOfStudy.length === 0

  if (isAllFields) {
    satisfiedCriteria.push({
      id: 'field-of-study',
      type: 'field_of_study',
      label: 'Field of Study',
      status: 'satisfied',
      isMandatory: true,
      message: 'All academic disciplines and majors are eligible.',
      studentValue: profile.fieldOfStudy || 'All fields',
      requiredValue: 'Open to all disciplines',
    })
  } else {
    if (!profile.fieldOfStudy?.trim()) {
      missingInformation.push({
        id: 'field-of-study',
        type: 'field_of_study',
        label: 'Field of Study',
        status: 'missing_info',
        isMandatory: true,
        message: 'Provide your primary major or discipline to confirm subject eligibility.',
        requiredValue: fieldsOfStudy.join(', '),
      })
    } else {
      const studentFieldLower = profile.fieldOfStudy.toLowerCase()
      const matchesField = fieldsOfStudy.some((f) => {
        const target = f.toLowerCase()
        return (
          studentFieldLower.includes(target) ||
          target.includes(studentFieldLower) ||
          (target.includes('stem') &&
            (studentFieldLower.includes('computer') ||
              studentFieldLower.includes('data') ||
              studentFieldLower.includes('engineer') ||
              studentFieldLower.includes('math') ||
              studentFieldLower.includes('science')))
        )
      })

      if (matchesField) {
        satisfiedCriteria.push({
          id: 'field-of-study',
          type: 'field_of_study',
          label: 'Field of Study',
          status: 'satisfied',
          isMandatory: true,
          message: `Your field (${profile.fieldOfStudy}) matches eligible disciplines.`,
          studentValue: profile.fieldOfStudy,
          requiredValue: fieldsOfStudy.join(', '),
        })
      } else {
        failedCriteria.push({
          id: 'field-of-study',
          type: 'field_of_study',
          label: 'Field of Study',
          status: 'failed',
          isMandatory: true,
          message: `Your major (${profile.fieldOfStudy}) is outside the designated fields (${fieldsOfStudy.join(', ')}).`,
          studentValue: profile.fieldOfStudy,
          requiredValue: fieldsOfStudy.join(', '),
        })
      }
    }
  }

  // 4. Study Destination Check (Preference / Non-mandatory)
  const isGlobalDest =
    eligibleDestinations.includes('GLOBAL') ||
    eligibleDestinations.length === 0

  if (!isGlobalDest) {
    if (
      !profile.preferredStudyDestinations ||
      profile.preferredStudyDestinations.length === 0
    ) {
      missingInformation.push({
        id: 'destination',
        type: 'study_destination',
        label: 'Study Destination',
        status: 'missing_info',
        isMandatory: false,
        message: 'Add your preferred destination countries to confirm study location alignment.',
        requiredValue: eligibleDestinations.join(', '),
      })
    } else {
      const destMatches = profile.preferredStudyDestinations.some((d) =>
        eligibleDestinations.some(
          (target) => target.toLowerCase() === d.toLowerCase(),
        ),
      )

      if (destMatches) {
        satisfiedCriteria.push({
          id: 'destination',
          type: 'study_destination',
          label: 'Study Destination',
          status: 'satisfied',
          isMandatory: false,
          message: 'Study location matches your preferred destination list.',
          studentValue: profile.preferredStudyDestinations.join(', '),
          requiredValue: eligibleDestinations.join(', '),
        })
      } else {
        failedCriteria.push({
          id: 'destination',
          type: 'study_destination',
          label: 'Study Destination',
          status: 'failed',
          isMandatory: false,
          message: `Study must take place in ${eligibleDestinations.join(', ')}.`,
          studentValue: profile.preferredStudyDestinations.join(', '),
          requiredValue: eligibleDestinations.join(', '),
        })
      }
    }
  }

  // 5. Academic Score Minimum Check (Mandatory if specified)
  const academicReq = scholarship.academicRequirement ?? (scholarship.minGpa ? {
    minScore: scholarship.minGpa,
    scale: 'gpa_4' as const,
    description: `Minimum ${scholarship.minGpa} GPA`,
  } : undefined)
  if (academicReq && typeof academicReq.minScore === 'number' && academicReq.minScore > 0) {
    if (!profile.academicScore || !profile.academicScore.value) {
      missingInformation.push({
        id: 'academic-score',
        type: 'academic_score',
        label: 'Academic Performance Minimum',
        status: 'missing_info',
        isMandatory: true,
        message: 'Provide your academic score or GPA to evaluate academic cutoff requirements.',
        requiredValue: academicReq.description,
      })
    } else {
      const studentPct = normalizeScoreToPercentage(
        profile.academicScore.value,
        profile.academicScore.scale,
      )
      const requiredPct = normalizeScoreToPercentage(
        academicReq.minScore,
        academicReq.scale || 'gpa_4',
      )

      if (studentPct >= requiredPct) {
        satisfiedCriteria.push({
          id: 'academic-score',
          type: 'academic_score',
          label: 'Academic Performance Minimum',
          status: 'satisfied',
          isMandatory: true,
          message: `Your score (${profile.academicScore.label || profile.academicScore.value}) meets or exceeds the minimum requirement.`,
          studentValue: profile.academicScore.label || `${profile.academicScore.value} (${profile.academicScore.scale})`,
          requiredValue: academicReq.description,
        })
      } else {
        failedCriteria.push({
          id: 'academic-score',
          type: 'academic_score',
          label: 'Academic Performance Minimum',
          status: 'failed',
          isMandatory: true,
          message: `Your score (${profile.academicScore.label || profile.academicScore.value}) falls below the required threshold (${academicReq.description}).`,
          studentValue: profile.academicScore.label || `${profile.academicScore.value} (${profile.academicScore.scale})`,
          requiredValue: academicReq.description,
        })
      }
    }
  }

  // 6. Financial Need Check (Mandatory if need-based)
  if (scholarship.financialRequirement?.requiresNeed) {
    if (profile.financialNeed) {
      satisfiedCriteria.push({
        id: 'financial-need',
        type: 'financial_need',
        label: 'Demonstrated Financial Need',
        status: 'satisfied',
        isMandatory: true,
        message: 'Self-reported financial need criteria confirmed.',
        studentValue: 'Demonstrated Need',
        requiredValue: 'Need-based qualification required',
      })
    } else {
      failedCriteria.push({
        id: 'financial-need',
        type: 'financial_need',
        label: 'Demonstrated Financial Need',
        status: 'failed',
        isMandatory: true,
        message: 'This scholarship requires demonstrated financial need, but need was not indicated in your profile.',
        studentValue: 'No need indicated',
        requiredValue: 'Need-based qualification required',
      })
    }
  }

  // 7. First Generation Requirement (Mandatory if applicable)
  if (scholarship.requiresFirstGen) {
    if (profile.firstGeneration) {
      satisfiedCriteria.push({
        id: 'first-gen',
        type: 'first_generation',
        label: 'First-Generation College Student',
        status: 'satisfied',
        isMandatory: true,
        message: 'First-generation scholar status confirmed in profile.',
        studentValue: 'First-generation scholar',
        requiredValue: 'First-generation status required',
      })
    } else {
      failedCriteria.push({
        id: 'first-gen',
        type: 'first_generation',
        label: 'First-Generation College Student',
        status: 'failed',
        isMandatory: true,
        message: 'This scholarship is exclusively reserved for first-generation university students.',
        studentValue: 'Not indicated as first-generation',
        requiredValue: 'First-generation status required',
      })
    }
  }

  // Calculate Overall Status and Explainable Score
  const hasMandatoryFailure = failedCriteria.some((c) => c.isMandatory)
  const hasMissingInfo = missingInformation.length > 0

  let status: EligibilityStatus
  let matchScore: number
  let summaryRationale: string

  const totalCriteria =
    satisfiedCriteria.length + failedCriteria.length + missingInformation.length
  const satisfiedCount = satisfiedCriteria.length

  if (hasMandatoryFailure) {
    status = 'not_eligible'
    // Never allow a high percentage score when mandatory criteria fail
    matchScore = Math.min(30, Math.round((satisfiedCount / Math.max(1, totalCriteria)) * 100))
    const failedNames = failedCriteria
      .filter((c) => c.isMandatory)
      .map((c) => c.label)
      .join(', ')
    summaryRationale = `Not eligible: Does not meet mandatory requirements for ${failedNames}.`
  } else if (hasMissingInfo) {
    status = 'potential_match'
    // Score based on known criteria, marked as incomplete
    matchScore = Math.round((satisfiedCount / Math.max(1, totalCriteria)) * 85)
    const missingNames = missingInformation.map((c) => c.label).join(', ')
    summaryRationale = `Potential match: Meets all verified criteria, but information is still needed for ${missingNames}.`
  } else {
    status = 'strong_match'
    matchScore = Math.min(100, Math.max(90, Math.round((satisfiedCount / Math.max(1, totalCriteria)) * 100)))
    summaryRationale = 'Strong match: Meets all known academic, geographic, and field eligibility requirements.'
  }

  return {
    scholarshipId: scholarship.id,
    status,
    matchScore,
    satisfiedCriteria,
    failedCriteria,
    missingInformation,
    summaryRationale,
    isEstimateNotice,
  }
}
