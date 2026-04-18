export type AnyObject = Record<string, unknown>

export const asObject = (value: unknown): AnyObject => {
  if (typeof value === 'object' && value !== null) {
    return value as AnyObject
  }

  return {}
}

export const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : [])

export const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  return fallback
}

export const toStringValue = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  return fallback
}

export const toBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') {
      return true
    }

    if (value.toLowerCase() === 'false') {
      return false
    }
  }

  return fallback
}
