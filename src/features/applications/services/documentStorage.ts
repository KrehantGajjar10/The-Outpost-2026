/**
 * Local-only document attachment storage utility.
 * Uses browser storage (localStorage with safe fallback) to store small proof/draft files.
 * Clearly communicates local-only storage: no data is uploaded to remote servers.
 */

const ATTACHMENT_STORAGE_PREFIX = 'grantly_doc_file_'
export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 // 2MB limit

export interface StoredAttachment {
  name: string
  type: string
  size: number
  data: string // Data URL or text payload
  savedAt: string
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const documentStorage = {
  /**
   * Save an attachment locally in the browser
   */
  saveAttachment(docId: string, attachment: Omit<StoredAttachment, 'savedAt'>): boolean {
    if (attachment.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File exceeds maximum allowed size of 2MB (${formatFileSize(attachment.size)})`)
    }

    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false
      }
      const record: StoredAttachment = {
        ...attachment,
        savedAt: new Date().toISOString(),
      }
      window.localStorage.setItem(ATTACHMENT_STORAGE_PREFIX + docId, JSON.stringify(record))
      return true
    } catch (err) {
      console.warn(`[documentStorage] Storage quota exceeded or disabled:`, err)
      return false
    }
  },

  /**
   * Retrieve an attachment by document ID
   */
  getAttachment(docId: string): StoredAttachment | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return null
      }
      const item = window.localStorage.getItem(ATTACHMENT_STORAGE_PREFIX + docId)
      if (!item) return null
      return JSON.parse(item) as StoredAttachment
    } catch (err) {
      console.warn(`[documentStorage] Failed to read attachment ${docId}:`, err)
      return null
    }
  },

  /**
   * Delete an attachment from local storage
   */
  deleteAttachment(docId: string): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false
      }
      window.localStorage.removeItem(ATTACHMENT_STORAGE_PREFIX + docId)
      return true
    } catch {
      return false
    }
  },

  /**
   * Reads a browser File object as a base64 Data URL
   */
  readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        reject(new Error(`File exceeds 2MB limit: ${file.name} is ${formatFileSize(file.size)}`))
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Failed to encode file as base64 string'))
        }
      }
      reader.onerror = () => reject(reader.error || new Error('Error reading file'))
      reader.readAsDataURL(file)
    })
  },
}
