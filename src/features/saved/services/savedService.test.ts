import { describe, it, expect, beforeEach } from 'vitest'
import { savedService } from './savedService'

describe('savedService', () => {
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

  it('initializes with default seed scholarships', () => {
    const saved = savedService.getSavedIds()
    expect(saved.length).toBeGreaterThan(0)
    expect(savedService.isSaved('sch-horizon-stem-2026')).toBe(true)
  })

  it('can toggle, save and remove scholarship IDs', () => {
    const newId = 'sch-custom-test-101'
    expect(savedService.isSaved(newId)).toBe(false)

    savedService.save(newId)
    expect(savedService.isSaved(newId)).toBe(true)

    savedService.remove(newId)
    expect(savedService.isSaved(newId)).toBe(false)

    savedService.toggle(newId)
    expect(savedService.isSaved(newId)).toBe(true)
  })

  it('safely handles non-array corrupted storage data', () => {
    store['grantly_saved_scholarship_ids'] = JSON.stringify({ not: 'array' })
    const recovered = savedService.getSavedIds()
    expect(Array.isArray(recovered)).toBe(true)
  })
})
