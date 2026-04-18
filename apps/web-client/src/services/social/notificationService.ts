import { mockNotifications } from '../../data/socialMockData'
import { httpClient } from '../api/httpClient'
import { withFallback } from './fallback'
import type { NotificationItem, NotificationKind } from '../../types/social'

interface NotificationDto {
  id?: string | number
  notificationId?: string | number
  type?: string
  kind?: string
  title?: string
  titre?: string
  message?: string
  contenu?: string
  createdAt?: string
  read?: boolean
  lu?: boolean
}

let notificationsCache: NotificationItem[] = [...mockNotifications]

const normalizeKind = (value: string | undefined): NotificationKind => {
  const normalized = (value ?? '').toLowerCase()

  if (normalized.includes('success')) {
    return 'success'
  }

  if (normalized.includes('warn')) {
    return 'warning'
  }

  if (normalized.includes('alert') || normalized.includes('error')) {
    return 'alert'
  }

  return 'info'
}

const mapNotification = (payload: NotificationDto): NotificationItem => ({
  id: String(payload.id ?? payload.notificationId ?? Date.now()),
  kind: normalizeKind(payload.type ?? payload.kind),
  title: payload.title ?? payload.titre ?? 'Notification',
  message: payload.message ?? payload.contenu ?? '',
  createdAt: payload.createdAt ?? new Date().toISOString(),
  read: payload.read ?? payload.lu ?? false,
})

export const getNotifications = async (): Promise<NotificationItem[]> =>
  withFallback(
    async () => {
      const response = await httpClient.get<NotificationDto[]>('/v1/notifications/my')
      return response.data.map(mapNotification)
    },
    () => notificationsCache,
  )

export const markNotificationAsRead = async (id: string): Promise<void> => {
  await withFallback(
    async () => {
      await httpClient.post(`/v1/notifications/${id}/read`)
    },
    () => {
      notificationsCache = notificationsCache.map((item) =>
        item.id === id ? { ...item, read: true } : item,
      )
    },
  )
}

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await withFallback(
    async () => {
      await httpClient.post('/v1/notifications/read-all')
    },
    () => {
      notificationsCache = notificationsCache.map((item) => ({ ...item, read: true }))
    },
  )
}
