import { storage } from '../../../services/storage'

const SAVED_STORAGE_KEY = 'grantly_saved_scholarship_ids'
export const SAVED_CHANGED_EVENT = 'grantly:saved_changed'

// Default seed saved scholarships for initial prototype experience
const DEFAULT_SAVED_IDS = [
  'sch-horizon-stem-2026',
  'sch-civic-impact-2026',
  'sch-apex-tech-2026',
  'sch-beacon-firstgen-2026',
]

/**
 * Service to manage saved (bookmarked) scholarships with localStorage persistence
 * and cross-component event synchronization.
 */
export const savedService = {
  getSavedIds(): string[] {
    const raw = storage.getItem<unknown>(SAVED_STORAGE_KEY, null)
    if (!Array.isArray(raw)) {
      // Seed default saved IDs on first run
      storage.setItem(SAVED_STORAGE_KEY, DEFAULT_SAVED_IDS)
      return [...DEFAULT_SAVED_IDS]
    }
    // Filter to ensure all items are valid strings
    return raw.filter((item): item is string => typeof item === 'string')
  },

  isSaved(scholarshipId: string): boolean {
    const ids = this.getSavedIds()
    return ids.includes(scholarshipId)
  },

  save(scholarshipId: string): boolean {
    if (!scholarshipId) return false
    const ids = this.getSavedIds()
    if (!ids.includes(scholarshipId)) {
      const updated = [...ids, scholarshipId]
      const success = storage.setItem(SAVED_STORAGE_KEY, updated)
      if (success && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(SAVED_CHANGED_EVENT, { detail: updated }))
      }
      return success
    }
    return true
  },

  remove(scholarshipId: string): boolean {
    if (!scholarshipId) return false
    const ids = this.getSavedIds()
    if (ids.includes(scholarshipId)) {
      const updated = ids.filter((id) => id !== scholarshipId)
      const success = storage.setItem(SAVED_STORAGE_KEY, updated)
      if (success && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(SAVED_CHANGED_EVENT, { detail: updated }))
      }
      return success
    }
    return true
  },

  toggle(scholarshipId: string): boolean {
    if (this.isSaved(scholarshipId)) {
      this.remove(scholarshipId)
      return false
    } else {
      this.save(scholarshipId)
      return true
    }
  },

  clearAll(): void {
    storage.setItem(SAVED_STORAGE_KEY, [])
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(SAVED_CHANGED_EVENT, { detail: [] }))
    }
  },
}
