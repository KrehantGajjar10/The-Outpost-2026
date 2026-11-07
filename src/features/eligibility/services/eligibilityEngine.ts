import type { Scholarship } from '../../scholarships/types/scholarship'
import type { StudentProfile } from '../../profile/types/profile'
import type {
  EligibilityAssessment,
  EligibilityCriterionResult,
  EligibilityStatus,
} from '../types/eligibility'
import { isCountryMatch, isNationalityMatch } from '../../../lib/utils'

/**
 * Normalizes academic scores for compatible scales (GPA 4.0 and GPA 5.0).
 * Returns null for ungraded or incompatible scales ('none', 'uk_honours').
 */
export function normalizeScoreToPercentage(value: number, scale: string): number | null {
  if (!value || isNaN(value) || scale === 'none' || scale === 'uk_honours') {
    return null
  }
  switch (scale) {
    case 'gpa_4':
      return Math.min(100, Math.round((value / 4.0) * 100))
    case 'gpa_5':
      return Math.min(100, Math.round((value / 5.0) * 100))
    case 'percentage':
      return Math.min(100, Math.max(0, value))
    default:
      return null
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

  const isGlobalCountry =
    eligibleCountries.includes('GLOBAL') || eligibleCountries.length === 0
  const isAnyNationality =
    nationalityRequirements.includes('ANY') || nationalityRequirements.length === 0

  // 1. Geographic Eligibility: Evaluated Independently
  // A match in residency must NEVER bypass a nationality restriction, and vice versa.
  if (isGlobalCountry && isAnyNationality) {
    satisfiedCriteria.push({
      id: 'geographic-eligibility',
      type: 'residence_or_nationality',
      label: 'Geographic Eligibility',
      status: 'satisfied',
      isMandatory: true,
      message: 'Open to applicants globally without nationality or residency restrictions.',
      studentValue: `${profile.countryOfResidence || 'Unknown'} (${profile.nationality || 'Unknown'})`,
      requiredValue: 'Global / All Nationalities',
    })
  } else {
    // 1a. Country of Residence Check
    if (!isGlobalCountry) {
      if (!profile.countryOfResidence?.trim()) {
        missingInformation.push({
          id: 'residence-check',
          type: 'residence_or_nationality',
          label: 'Country of Residence',
          status: 'missing_info',
          isMandatory: true,
          message: 'Add your country of residence to verify geographic qualification.',
          requiredValue: eligibleCountries.join(', '),
        })
      } else {
        const countryMatches = eligibleCountries.some((c) =>
          isCountryMatch(c, profile.countryOfResidence),
        )

        if (countryMatches) {
          satisfiedCriteria.push({
            id: 'residence-check',
            type: 'residence_or_nationality',
            label: 'Country of Residence',
            status: 'satisfied',
            isMandatory: true,
            message: `Your residency in ${profile.countryOfResidence} satisfies regional eligibility.`,
            studentValue: profile.countryOfResidence,
            requiredValue: eligibleCountries.join(', '),
          })
        } else {
          failedCriteria.push({
            id: 'residence-check',
            type: 'residence_or_nationality',
            label: 'Country of Residence',
            status: 'failed',
            isMandatory: true,
            message: `Applicant residing in ${profile.countryOfResidence} does not meet designated countries (${eligibleCountries.join(', ')}).`,
            studentValue: profile.countryOfResidence,
            requiredValue: eligibleCountries.join(', '),
          })
        }
      }
    }

    // 1b. Nationality Requirement Check (Independent of residency!)
    if (!isAnyNationality) {
      if (!profile.nationality?.trim()) {
        missingInformation.push({
          id: 'nationality-check',
          type: 'residence_or_nationality',
          label: 'Nationality Requirement',
          status: 'missing_info',
          isMandatory: true,
          message: 'Add your nationality to verify citizenship eligibility.',
          requiredValue: nationalityRequirements.join(', '),
        })
      } else {
        const nationalityMatches = nationalityRequirements.some((n) =>
          isNationalityMatch(profile.nationality, n),
        )

        if (nationalityMatches) {
          satisfiedCriteria.push({
            id: 'nationality-check',
            type: 'residence_or_nationality',
            label: 'Nationality Requirement',
            status: 'satisfied',
            isMandatory: true,
            message: `Your nationality (${profile.nationality}) satisfies designated requirements.`,
            studentValue: profile.nationality,
            requiredValue: nationalityRequirements.join(', '),
          })
        } else {
          failedCriteria.push({
            id: 'nationality-check',
            type: 'residence_or_nationality',
            label: 'Nationality Requirement',
            status: 'failed',
            isMandatory: true,
            message: `Applicant nationality (${profile.nationality}) does not match designated requirements (${nationalityRequirements.join(', ')}).`,
            studentValue: profile.nationality,
            requiredValue: nationalityRequirements.join(', '),
          })
        }
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
    eligibleDestinations.includes('GLOBAL') || eligibleDestinations.length === 0

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
        eligibleDestinations.some((target) => isCountryMatch(target, d)),
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

  // 5. Academic Score Minimum Check
  const academicReq = scholarship.academicRequirement ?? (scholarship.minGpa ? {
    minScore: scholarship.minGpa,
    scale: 'gpa_4' as const,
    description: `Minimum ${scholarship.minGpa} GPA`,
  } : undefined)

  if (academicReq && typeof academicReq.minScore === 'number' && academicReq.minScore > 0 && academicReq.scale !== 'none') {
    if (!profile.academicScore || !profile.academicScore.scale) {
      missingInformation.push({
        id: 'academic-score',
        type: 'academic_score',
        label: 'Academic Performance Minimum',
        status: 'missing_info',
        isMandatory: true,
        message: 'Provide your academic score or GPA to evaluate academic cutoff requirements.',
        requiredValue: academicReq.description,
      })
    } else if (profile.academicScore.scale === 'none') {
      // Explicitly handle 'none' scale without artificial percentage or GPA conversion
      missingInformation.push({
        id: 'academic-score',
        type: 'academic_score',
        label: 'Academic Performance Minimum',
        status: 'missing_info',
        isMandatory: true,
        message: `This opportunity requires a numerical minimum (${academicReq.description}), but your institution uses a non-numerical grading system ("None"). Manual transcript review is required.`,
        studentValue: 'Ungraded / Non-numerical scale',
        requiredValue: academicReq.description,
      })
    } else {
      const studentScale = profile.academicScore.scale
      const requiredScale = academicReq.scale || 'gpa_4'

      // Check for scale compatibility
      const areIdenticalScales = studentScale === requiredScale
      const areGpaCompatible =
        (studentScale === 'gpa_4' && requiredScale === 'gpa_5') ||
        (studentScale === 'gpa_5' && requiredScale === 'gpa_4')

      if (areIdenticalScales) {
        if (profile.academicScore.value >= academicReq.minScore) {
          satisfiedCriteria.push({
            id: 'academic-score',
            type: 'academic_score',
            label: 'Academic Performance Minimum',
            status: 'satisfied',
            isMandatory: true,
            message: `Your score (${profile.academicScore.label || profile.academicScore.value}) meets or exceeds the minimum requirement.`,
            studentValue: profile.academicScore.label || `${profile.academicScore.value} (${studentScale})`,
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
            studentValue: profile.academicScore.label || `${profile.academicScore.value} (${studentScale})`,
            requiredValue: academicReq.description,
          })
        }
      } else if (areGpaCompatible) {
        const studentPct = normalizeScoreToPercentage(profile.academicScore.value, studentScale)
        const requiredPct = normalizeScoreToPercentage(academicReq.minScore, requiredScale)

        if (studentPct !== null && requiredPct !== null && studentPct >= requiredPct) {
          satisfiedCriteria.push({
            id: 'academic-score',
            type: 'academic_score',
            label: 'Academic Performance Minimum',
            status: 'satisfied',
            isMandatory: true,
            message: `Your score (${profile.academicScore.label || profile.academicScore.value}) proportionally meets the required threshold.`,
            studentValue: profile.academicScore.label || `${profile.academicScore.value} (${studentScale})`,
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
            studentValue: profile.academicScore.label || `${profile.academicScore.value} (${studentScale})`,
            requiredValue: academicReq.description,
          })
        }
      } else {
        // Incompatible scales: avoid assuming universal percentage conversion
        missingInformation.push({
          id: 'academic-score',
          type: 'academic_score',
          label: 'Academic Score Equivalency Verification',
          status: 'missing_info',
          isMandatory: true,
          message: `Grading scale mismatch: Your profile reports on the ${studentScale} scale, while this scholarship requires ${requiredScale}. Manual transcript evaluation is required.`,
          studentValue: profile.academicScore.label || `${profile.academicScore.value} (${studentScale})`,
          requiredValue: academicReq.description,
        })
      }
    }
  }

  // 6. Financial Need Check (Tri-State Handling)
  if (scholarship.financialRequirement?.requiresNeed) {
    if (profile.financialNeed === true) {
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
    } else if (profile.financialNeed === false) {
      failedCriteria.push({
        id: 'financial-need',
        type: 'financial_need',
        label: 'Demonstrated Financial Need',
        status: 'failed',
        isMandatory: true,
        message: 'This scholarship requires demonstrated financial need, but no need was indicated in your profile.',
        studentValue: 'No need indicated',
        requiredValue: 'Need-based qualification required',
      })
    } else {
      // Unknown / undefined financial need status
      missingInformation.push({
        id: 'financial-need',
        type: 'financial_need',
        label: 'Demonstrated Financial Need Confirmation',
        status: 'missing_info',
        isMandatory: true,
        message: 'Please indicate your financial need status in your student profile to evaluate this need-based grant.',
        requiredValue: 'Need-based qualification required',
      })
    }
  }

  // 7. First Generation Requirement (Tri-State Handling)
  if (scholarship.requiresFirstGen) {
    if (profile.firstGeneration === true) {
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
    } else if (profile.firstGeneration === false) {
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
    } else {
      // Unknown / undefined first-generation status
      missingInformation.push({
        id: 'first-gen',
        type: 'first_generation',
        label: 'First-Generation Status Confirmation',
        status: 'missing_info',
        isMandatory: true,
        message: 'Please specify your first-generation college student status in your profile.',
        requiredValue: 'First-generation status required',
      })
    }
  }

  // Calculate Overall Status and Explainable Score
  const hasMandatoryFailure = failedCriteria.some((c) => c.isMandatory)
  const hasOptionalFailure = failedCriteria.some((c) => !c.isMandatory)
  const hasMissingInfo = missingInformation.length > 0

  let status: EligibilityStatus
  let matchScore: number
  let summaryRationale: string

  const totalCriteria =
    satisfiedCriteria.length + failedCriteria.length + missingInformation.length
  const satisfiedCount = satisfiedCriteria.length

  if (hasMandatoryFailure) {
    status = 'not_eligible'
    // Mandatory failure must never yield a high score
    matchScore = Math.min(30, Math.round((satisfiedCount / Math.max(1, totalCriteria)) * 100))
    const failedNames = failedCriteria
      .filter((c) => c.isMandatory)
      .map((c) => c.label)
      .join(', ')
    summaryRationale = `Not eligible: Does not meet mandatory requirements for ${failedNames}.`
  } else if (hasMissingInfo) {
    status = 'potential_match'
    // Score based on known criteria, capped at 75 due to missing data
    matchScore = Math.min(75, Math.round((satisfiedCount / Math.max(1, totalCriteria)) * 85))
    const missingNames = missingInformation.map((c) => c.label).join(', ')
    summaryRationale = `Potential match: Meets verified criteria, but information is needed for ${missingNames}.`
  } else if (hasOptionalFailure) {
    // Meets all mandatory criteria, but failed an optional preference (e.g. study destination)
    status = 'potential_match'
    const nonMandatoryFailed = failedCriteria.filter((c) => !c.isMandatory).map((c) => c.label).join(', ')
    matchScore = Math.min(80, Math.round((satisfiedCount / Math.max(1, totalCriteria)) * 100))
    summaryRationale = `Potential match: Meets all mandatory criteria, but does not match optional preferences for ${nonMandatoryFailed}.`
  } else {
    status = 'strong_match'
    matchScore = Math.min(100, Math.max(90, Math.round((satisfiedCount / Math.max(1, totalCriteria)) * 100)))
    summaryRationale = 'Strong match: Meets all verified academic, geographic, and program eligibility requirements.'
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
