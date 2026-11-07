import { describe, it, expect, beforeEach } from 'vitest'
import { storage } from './storage'

describe('storage utility', () => {
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
    }
  })

  it('reads and writes valid JSON data', () => {
    const data = { name: 'Elena', count: 42 }
    expect(storage.setItem('test_key', data)).toBe(true)
    expect(storage.getItem('test_key', null)).toEqual(data)
  })

  it('returns fallback value if key is not found', () => {
    expect(storage.getItem('missing_key', 'default_val')).toBe('default_val')
  })

  it('handles corrupted/malformed JSON in localStorage gracefully without throwing', () => {
    store['corrupted_key'] = '{not_json:::'
    const fallback = { fallback: true }
    expect(storage.getItem('corrupted_key', fallback)).toEqual(fallback)
  })

  it('removes keys cleanly', () => {
    storage.setItem('to_delete', 123)
    storage.removeItem('to_delete')
    expect(storage.getItem('to_delete', null)).toBeNull()
  })
})
