import { AxiosError } from 'axios'
import type { ApiProblem } from '../types/domain'

export interface NormalizedError {
  message: string
  statusCode?: number
  validationErrors?: Record<string, string>
}

export const normalizeApiError = (error: unknown): NormalizedError => {
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status
    const payload = error.response?.data as ApiProblem | string | undefined

    if (typeof payload === 'string' && payload.trim().length > 0) {
      return { message: payload, statusCode }
    }

    if (payload && typeof payload === 'object') {
      const message = typeof payload.message === 'string' ? payload.message : undefined
      return {
        message: message ?? `Request failed with status ${statusCode ?? 'unknown'}`,
        statusCode,
        validationErrors: payload.validationErrors,
      }
    }

    return {
      message: `Request failed with status ${statusCode ?? 'unknown'}`,
      statusCode,
    }
  }

  if (error instanceof Error) {
    return { message: error.message }
  }

  return { message: 'Unexpected error' }
}
