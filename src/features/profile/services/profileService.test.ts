import { describe, it, expect, beforeEach } from 'vitest'
import { profileService } from './profileService'
import { DEFAULT_STUDENT_PROFILE } from '../data/defaultProfile'
import type { StudentProfile } from '../types/profile'

describe('profileService', () => {
  const store: Record<string, string> = {}

  beforeEach(() => {
    for (const key in store) delete store[key]
    ;(globalThis as unknown as { window: unknown }).window = {
      localStorage: {
        getItem: (k: string) => store[k] ?? null,
        setItem: (k: string, v: string) => {
          store[k] = String(v)
        },
        removeItem: (k: string) => {
          delete store[k]
        },
        clear: () => {
          for (const key in store) delete store[key]
        },
      },
      dispatchEvent: () => true,
      CustomEvent: class CustomEvent {
        type: string
        init?: unknown
        constructor(type: string, init?: unknown) {
          this.type = type
          this.init = init
        }
      },
    }
  })

  it('retrieves default profile when storage is empty', () => {
    const profile = profileService.getProfile()
    expect(profile.fullName).toBe(DEFAULT_STUDENT_PROFILE.fullName)
    expect(profile.countryOfResidence).toBe(DEFAULT_STUDENT_PROFILE.countryOfResidence)
  })

  it('saves and retrieves modified student profile', () => {
    const updated: StudentProfile = {
      ...DEFAULT_STUDENT_PROFILE,
      fullName: 'Aarav Sharma',
      countryOfResidence: 'India',
      nationality: 'Indian',
      academicScore: {
        value: 92,
        scale: 'percentage',
        label: '92% Aggregate',
      },
    }

    profileService.saveProfile(updated)
    const fetched = profileService.getProfile()
    expect(fetched.fullName).toBe('Aarav Sharma')
    expect(fetched.countryOfResidence).toBe('India')
    expect(fetched.academicScore.value).toBe(92)
  })

  it('resets profile back to default demonstration values', () => {
    profileService.saveProfile({
      ...DEFAULT_STUDENT_PROFILE,
      fullName: 'Temporary User',
    })
    const reset = profileService.resetProfile()
    expect(reset.fullName).toBe(DEFAULT_STUDENT_PROFILE.fullName)
  })

  it('safely recovers when storage contains corrupted JSON', () => {
    store['grantly_student_profile'] = 'invalid_json_string{'
    const recovered = profileService.getProfile()
    expect(recovered.fullName).toBe(DEFAULT_STUDENT_PROFILE.fullName)
  })
})
