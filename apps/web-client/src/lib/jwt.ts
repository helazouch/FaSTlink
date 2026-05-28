const decodeBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
  return decodeURIComponent(
    Array.from(atob(padded))
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join(''),
  )
}

export const decodeJwtPayload = <T extends Record<string, unknown>>(token: string): Partial<T> => {
  const [, payload] = token.split('.')
  if (!payload) {
    return {}
  }

  try {
    return JSON.parse(decodeBase64Url(payload)) as Partial<T>
  } catch {
    return {}
  }
}
