import type { AuditLogEntry } from '../types/domain'

const AUDIT_STORAGE_KEY = 'fastlink.admin.audit'
const MAX_AUDIT_ITEMS = 500

const readAll = (): AuditLogEntry[] => {
  if (typeof window === 'undefined') {
    return []
  }

  const rawValue = window.localStorage.getItem(AUDIT_STORAGE_KEY)
  if (!rawValue) {
    return []
  }

  try {
    const parsed = JSON.parse(rawValue) as AuditLogEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeAll = (entries: AuditLogEntry[]): void => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_AUDIT_ITEMS)))
}

export const appendAuditEntry = (
  action: string,
  resourceType: string,
  resourceId: string,
  status: AuditLogEntry['status'],
  details: string,
): void => {
  const next: AuditLogEntry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    action,
    resourceType,
    resourceId,
    status,
    details,
    createdAt: new Date().toISOString(),
  }

  const existing = readAll()
  writeAll([next, ...existing])
}

export const listLocalAuditEntries = (limit = 100): AuditLogEntry[] => {
  return readAll().slice(0, limit)
}
