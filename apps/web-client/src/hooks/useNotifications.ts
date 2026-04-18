import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../services/social/notificationService'
import { useAuthStore } from '../stores/authStore'
import { useNotificationStore } from '../stores/notificationStore'

const queryKeys = {
  notifications: ['notifications', 'my'] as const,
}

export const useNotifications = () => {
  const setItems = useNotificationStore((state) => state.setItems)
  const userId = useAuthStore((state) => state.user?.id)

  const query = useQuery({
    queryKey: [...queryKeys.notifications, userId] as const,
    queryFn: () => {
      if (!userId) {
        return Promise.resolve([])
      }

      return getNotifications(userId)
    },
    enabled: Boolean(userId),
  })

  useEffect(() => {
    if (query.data) {
      setItems(query.data)
    }
  }, [query.data, setItems])

  return query
}

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient()
  const userId = useAuthStore((state) => state.user?.id)
  const markAsReadInStore = useNotificationStore((state) => state.markAsRead)

  return useMutation({
    mutationFn: (id: string) => {
      if (!userId) {
        throw new Error('You must be signed in to update notifications')
      }

      return markNotificationAsRead(id, userId)
    },
    onSuccess: (_, id) => {
      markAsReadInStore(id)
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
    },
  })
}

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient()
  const userId = useAuthStore((state) => state.user?.id)
  const notifications = useNotificationStore((state) => state.items)
  const markAllInStore = useNotificationStore((state) => state.markAllAsRead)

  return useMutation({
    mutationFn: () => {
      if (!userId) {
        throw new Error('You must be signed in to update notifications')
      }

      const unreadIds = notifications.filter((item) => !item.read).map((item) => item.id)
      return markAllNotificationsAsRead(userId, unreadIds)
    },
    onSuccess: () => {
      markAllInStore()
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
    },
  })
}
