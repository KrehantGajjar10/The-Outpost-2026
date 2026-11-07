import type { StudentProfile } from '../types/profile'

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  id: 'student-elena-rostova',
  fullName: 'Elena Rostova',
  preferredName: 'Elena',
  email: 'elena.rostova@pacific-demo.edu',
  countryOfResidence: 'Canada',
  nationality: 'Canadian',
  stateOrProvince: 'British Columbia',
  preferredStudyDestinations: ['Canada', 'Germany', 'United States', 'United Kingdom'],
  currentInstitution: 'Pacific Coast University',
  educationLevel: 'undergraduate',
  academicYear: 'Year 3 (Junior)',
  fieldOfStudy: 'Computer Science & Public Policy',
  academicScore: {
    value: 3.84,
    scale: 'gpa_4',
    label: '3.84 / 4.0 GPA (approx. 89%)',
  },
  financialNeed: true,
  firstGeneration: true,
  demonstrationProfile: true,
}
