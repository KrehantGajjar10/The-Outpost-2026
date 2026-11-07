import { describe, it, expect, beforeEach } from 'vitest'
import {
  documentStorage,
  formatFileSize,
  MAX_FILE_SIZE_BYTES,
} from './documentStorage'

describe('documentStorage', () => {
  beforeEach(() => {
    const store = new Map<string, string>()
    const localStorageMock = {
      getItem: (k: string) => store.get(k) || null,
      setItem: (k: string, v: string) => {
        store.set(k, v)
      },
      removeItem: (k: string) => {
        store.delete(k)
      },
      clear: () => store.clear(),
      length: 0,
      key: () => null,
    }

    if (typeof globalThis.window === 'undefined') {
      // @ts-expect-error Mocking window in Node test runner
      globalThis.window = {
        localStorage: localStorageMock,
      }
    } else {
      Object.defineProperty(globalThis.window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      })
    }
  })

  it('formats file sizes accurately for display', () => {
    expect(formatFileSize(500)).toBe('500 B')
    expect(formatFileSize(1024)).toBe('1.0 KB')
    expect(formatFileSize(512000)).toBe('500.0 KB')
    expect(formatFileSize(1572864)).toBe('1.5 MB')
  })

  it('saves and retrieves an attachment locally in the browser', () => {
    const saved = documentStorage.saveAttachment('doc-101', {
      name: 'transcript.pdf',
      type: 'application/pdf',
      size: 450000,
      data: 'data:application/pdf;base64,mockBytes',
    })
    expect(saved).toBe(true)

    const retrieved = documentStorage.getAttachment('doc-101')
    expect(retrieved).toBeTruthy()
    expect(retrieved?.name).toBe('transcript.pdf')
    expect(retrieved?.size).toBe(450000)
    expect(retrieved?.savedAt).toBeTruthy()
  })

  it('rejects attachments exceeding the 2MB size limit', () => {
    expect(() => {
      documentStorage.saveAttachment('doc-oversize', {
        name: 'huge_file.zip',
        type: 'application/zip',
        size: MAX_FILE_SIZE_BYTES + 1024,
        data: 'too_large',
      })
    }).toThrow(/exceeds maximum allowed size/)
  })

  it('deletes an attachment cleanly', () => {
    documentStorage.saveAttachment('doc-to-delete', {
      name: 'sample.txt',
      type: 'text/plain',
      size: 100,
      data: 'data:text/plain;base64,abc',
    })

    const deleted = documentStorage.deleteAttachment('doc-to-delete')
    expect(deleted).toBe(true)

    const check = documentStorage.getAttachment('doc-to-delete')
    expect(check).toBeNull()
  })
})
