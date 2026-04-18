import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCommunityById, getSuggestedCommunities } from '../services/social/communityService'
import { getUpcomingEvents, updateEventParticipation } from '../services/social/eventService'
import { getMyProfile } from '../services/social/profileService'
import { getMyRequests, submitRequest } from '../services/social/requestService'
import type { SubmitRequestInput, UpdateParticipationInput } from '../types/social'

const queryKeys = {
  communities: ['communities', 'suggested'] as const,
  communityById: (communityId: number) => ['communities', communityId] as const,
  events: ['events', 'upcoming'] as const,
  requests: ['requests', 'my'] as const,
  profile: ['profile', 'me'] as const,
}

export const useSuggestedCommunities = () =>
  useQuery({
    queryKey: queryKeys.communities,
    queryFn: getSuggestedCommunities,
  })

export const useCommunity = (communityId: number) =>
  useQuery({
    queryKey: queryKeys.communityById(communityId),
    queryFn: () => getCommunityById(communityId),
    enabled: Number.isFinite(communityId),
  })

export const useEvents = () =>
  useQuery({
    queryKey: queryKeys.events,
    queryFn: getUpcomingEvents,
  })

export const useUpdateParticipation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateParticipationInput) => updateEventParticipation(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.events })
    },
  })
}

export const useRequests = () =>
  useQuery({
    queryKey: queryKeys.requests,
    queryFn: getMyRequests,
  })

export const useSubmitRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: SubmitRequestInput) => submitRequest(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.requests })
    },
  })
}

export const useProfile = () =>
  useQuery({
    queryKey: queryKeys.profile,
    queryFn: getMyProfile,
  })
