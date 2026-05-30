import { AxiosError } from 'axios'

export interface AppError {
  message: string
  statusCode?: number
}

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error) {
    return error.message || fallback
  }

  return fallback
}

export const normalizeApiError = (error: unknown): AppError => {
  if (error instanceof AxiosError) {
    const payload = error.response?.data

    if (typeof payload === 'string' && payload.trim().length > 0) {
      return { message: payload, statusCode: error.response?.status }
    }

    if (payload && typeof payload === 'object' && 'message' in payload) {
      const message = (payload as { message?: unknown }).message
      const fieldErrors = (payload as { fieldErrors?: unknown; validationErrors?: unknown }).fieldErrors
        ?? (payload as { fieldErrors?: unknown; validationErrors?: unknown }).validationErrors
      const fieldMessage = fieldErrors && typeof fieldErrors === 'object'
        ? Object.entries(fieldErrors as Record<string, unknown>)
            .map(([field, value]) => `${field}: ${String(value)}`)
            .join(', ')
        : ''
      if (typeof message === 'string') {
        return { message: fieldMessage ? `${message} - ${fieldMessage}` : message, statusCode: error.response?.status }
      }
    }

    return {
      message: `Request failed with status ${error.response?.status ?? 'unknown'}`,
      statusCode: error.response?.status,
    }
  }

  return { message: getErrorMessage(error, 'Unexpected error') }
}
