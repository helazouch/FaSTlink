import axios, { type AxiosError } from 'axios'
import { env } from '../../config/env'
import { clearStoredSession, getStoredAccessToken } from '../auth/authStorage'

const AUTH_PATHS = ['/v1/auth/login']

const isAuthPath = (url: string): boolean => AUTH_PATHS.some((path) => url.includes(path))

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10_000,
})

const dispatchUnauthorized = () => {
  clearStoredSession()

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fastlink:admin:auth:unauthorized'))
  }
}

httpClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    const requestUrl = String(error.config?.url ?? '')

    if (status !== 401 || isAuthPath(requestUrl)) {
      return Promise.reject(error)
    }

    dispatchUnauthorized()
    return Promise.reject(error)
  },
)
