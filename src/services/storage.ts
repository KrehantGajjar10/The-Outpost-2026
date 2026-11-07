/**
 * Safe Browser Storage Service
 * Provides fault-tolerant localStorage reading, writing, and parsing with
 * graceful handling of storage quotas, SSR environments, disabled cookies,
 * and malformed JSON payloads.
 */

export const storage = {
  getItem<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback
    try {
      const raw = window.localStorage.getItem(key)
      if (raw === null) return fallback
      return JSON.parse(raw) as T
    } catch (error) {
      console.warn(`[storage] Error reading key "${key}" from localStorage:`, error)
      return fallback
    }
  },

  setItem<T>(key: string, value: T): boolean {
    if (typeof window === 'undefined') return false
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.warn(`[storage] Error writing key "${key}" to localStorage:`, error)
      return false
    }
  },

  removeItem(key: string): boolean {
    if (typeof window === 'undefined') return false
    try {
      window.localStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn(`[storage] Error removing key "${key}" from localStorage:`, error)
      return false
    }
  },
}
