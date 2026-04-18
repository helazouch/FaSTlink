import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../services/social/notificationService'
import { useNotificationStore } from '../stores/notificationStore'

const queryKeys = {
  notifications: ['notifications', 'my'] as const,
}

export const useNotifications = () => {
  const setItems = useNotificationStore((state) => state.setItems)

  const query = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: getNotifications,
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
  const markAsReadInStore = useNotificationStore((state) => state.markAsRead)

  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: (_, id) => {
      markAsReadInStore(id)
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
    },
  })
}

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient()
  const markAllInStore = useNotificationStore((state) => state.markAllAsRead)

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      markAllInStore()
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
    },
  })
}
