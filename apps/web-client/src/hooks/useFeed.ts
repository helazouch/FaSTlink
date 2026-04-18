import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { env } from '../config/env'
import { addComment, createPost, getFeedPage, toggleLike, toggleSavedPost } from '../services/social/feedService'
import { useAuthStore } from '../stores/authStore'
import { useFeedStore } from '../stores/feedStore'
import type { CreateCommentInput, CreatePostInput, FeedPage, FeedPost } from '../types/social'

const FEED_QUERY_KEY = 'social-feed'

const patchPostInPages = (
  current: { pages: FeedPage[]; pageParams: Array<string | null> } | undefined,
  nextPost: FeedPost,
) => {
  if (!current) {
    return current
  }

  return {
    ...current,
    pages: current.pages.map((page) => ({
      ...page,
      items: page.items.map((item) => (item.id === nextPost.id ? nextPost : item)),
    })),
  }
}

export const useInfiniteFeed = () => {
  const searchQuery = useFeedStore((state) => state.searchQuery)
  const activeCommunityId = useFeedStore((state) => state.activeCommunityId)

  return useInfiniteQuery({
    queryKey: [FEED_QUERY_KEY, searchQuery, activeCommunityId],
    queryFn: ({ pageParam }) =>
      getFeedPage(pageParam, env.feedPageSize, activeCommunityId, searchQuery),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}

export const useCreatePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreatePostInput) => createPost(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [FEED_QUERY_KEY],
      })
    },
  })
}

export const useToggleLike = () => {
  const queryClient = useQueryClient()
  const userId = useAuthStore((state) => state.user?.id)

  return useMutation({
    mutationFn: (postId: string) => {
      if (!userId) {
        throw new Error('You must be signed in to react to a post')
      }

      return toggleLike(postId, userId)
    },
    onSuccess: (post) => {
      queryClient.setQueriesData(
        {
          queryKey: [FEED_QUERY_KEY],
        },
        (current: { pages: FeedPage[]; pageParams: Array<string | null> } | undefined) =>
          patchPostInPages(current, post),
      )
    },
  })
}

export const useAddComment = () => {
  const queryClient = useQueryClient()
  const userId = useAuthStore((state) => state.user?.id)

  return useMutation({
    mutationFn: (input: CreateCommentInput) => {
      if (!userId) {
        throw new Error('You must be signed in to comment on a post')
      }

      return addComment(input, userId)
    },
    onSuccess: (post) => {
      queryClient.setQueriesData(
        {
          queryKey: [FEED_QUERY_KEY],
        },
        (current: { pages: FeedPage[]; pageParams: Array<string | null> } | undefined) =>
          patchPostInPages(current, post),
      )
    },
  })
}

export const useToggleSavedPost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      const updated = toggleSavedPost(postId)
      if (!updated) {
        throw new Error('Post not found')
      }

      return updated
    },
    onSuccess: (post) => {
      queryClient.setQueriesData(
        {
          queryKey: [FEED_QUERY_KEY],
        },
        (current: { pages: FeedPage[]; pageParams: Array<string | null> } | undefined) =>
          patchPostInPages(current, post),
      )
    },
  })
}
