import { storage } from '../../../services/storage'
import type { StudentProfile } from '../types/profile'
import { DEFAULT_STUDENT_PROFILE } from '../data/defaultProfile'

const PROFILE_STORAGE_KEY = 'grantly_student_profile'
export const PROFILE_CHANGED_EVENT = 'grantly:profile_changed'

/**
 * Service to manage student profile persistence with localStorage fallback
 * and event dispatching for reactive UI updates across routes.
 */
export const profileService = {
  getProfile(): StudentProfile {
    const data = storage.getItem<StudentProfile | null>(PROFILE_STORAGE_KEY, null)
    if (!data || typeof data !== 'object' || !data.fullName) {
      return DEFAULT_STUDENT_PROFILE
    }
    return {
      ...DEFAULT_STUDENT_PROFILE,
      ...data,
      academicScore: {
        ...DEFAULT_STUDENT_PROFILE.academicScore,
        ...(data.academicScore || {}),
      },
    }
  },

  saveProfile(profile: StudentProfile): boolean {
    const success = storage.setItem(PROFILE_STORAGE_KEY, profile)
    if (success && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(PROFILE_CHANGED_EVENT, { detail: profile }))
    }
    return success
  },

  resetProfile(): StudentProfile {
    this.saveProfile(DEFAULT_STUDENT_PROFILE)
    return DEFAULT_STUDENT_PROFILE
  },
}
