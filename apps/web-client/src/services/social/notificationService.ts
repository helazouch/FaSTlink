import { httpClient } from '../api/httpClient'
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

export const getNotifications = async (userId: number): Promise<NotificationItem[]> => {
  const response = await httpClient.get<NotificationDto[]>('/v1/notifications', {
    params: {
      utilisateurId: userId,
    },
  })

  return response.data.map(mapNotification)
}

export const markNotificationAsRead = async (id: string, userId: number): Promise<void> => {
  await httpClient.post(`/v1/notifications/${id}/read`, null, {
    params: {
      utilisateurId: userId,
    },
  })
}

export const markAllNotificationsAsRead = async (
  userId: number,
  notificationIds: string[],
): Promise<void> => {
  await Promise.all(
    notificationIds.map((id) =>
      httpClient.post(`/v1/notifications/${id}/read`, null, {
        params: {
          utilisateurId: userId,
        },
      }),
    ),
  )
}
