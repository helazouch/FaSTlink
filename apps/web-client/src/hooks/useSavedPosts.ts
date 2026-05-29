import { useInfiniteQuery } from '@tanstack/react-query'
import { env } from '../config/env'
import { getSavedPublicationsPage } from '../services/social/feedService'
import { useAuthStore } from '../stores/authStore'

export const SAVED_PUBLICATIONS_QUERY_KEY = 'saved-publications'

export const useInfiniteSavedPosts = () => {
  const userId = useAuthStore((state) => state.user?.id ?? null)

  return useInfiniteQuery({
    queryKey: [SAVED_PUBLICATIONS_QUERY_KEY, userId],
    queryFn: ({ pageParam }) => getSavedPublicationsPage(pageParam, env.feedPageSize),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: Boolean(userId),
  })
}
