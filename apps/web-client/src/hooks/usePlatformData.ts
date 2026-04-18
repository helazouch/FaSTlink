import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createEvent,
  createPublication,
  getDashboardSummary,
  getEvents,
  getNotifications,
  getPublications,
  markNotificationAsRead,
} from '../services/platformService'
import type { CreateEventInput, CreatePublicationInput } from '../types/domain'

const queryKeys = {
  summary: (entityId: number) => ['dashboard-summary', entityId] as const,
  publications: ['publications'] as const,
  events: ['events'] as const,
  notifications: (userId: number | null) => ['notifications', userId] as const,
}

export const useDashboardSummary = (entityId: number) =>
  useQuery({
    queryKey: queryKeys.summary(entityId),
    queryFn: () => getDashboardSummary(entityId),
  })

export const usePublications = () =>
  useQuery({
    queryKey: queryKeys.publications,
    queryFn: getPublications,
  })

export const useEvents = () =>
  useQuery({
    queryKey: queryKeys.events,
    queryFn: getEvents,
  })

export const useNotifications = (userId: number | null) =>
  useQuery({
    queryKey: queryKeys.notifications(userId),
    queryFn: () => getNotifications(userId as number),
    enabled: userId !== null,
  })

export const useMarkNotificationRead = (userId: number | null) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: number) => {
      if (userId === null) {
        throw new Error('Cannot mark notification as read without a user id')
      }

      return markNotificationAsRead(notificationId, userId)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications(userId),
      })
    },
  })
}

export const useCreatePublication = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreatePublicationInput) => createPublication(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.publications })
    },
  })
}

export const useCreateEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateEventInput) => createEvent(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.events })
    },
  })
}
