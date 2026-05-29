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
  const userId = useAuthStore((state) => state.user?.id ?? null)

  return useInfiniteQuery({
    queryKey: [FEED_QUERY_KEY, userId, searchQuery, activeCommunityId],
    queryFn: ({ pageParam }) =>
      getFeedPage(pageParam, env.feedPageSize, activeCommunityId, searchQuery, userId),
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

      return toggleLike(postId)
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: [FEED_QUERY_KEY] })
      const previous = queryClient.getQueriesData<{ pages: FeedPage[]; pageParams: Array<string | null> }>({
        queryKey: [FEED_QUERY_KEY],
      })

      queryClient.setQueriesData(
        { queryKey: [FEED_QUERY_KEY] },
        (current: { pages: FeedPage[]; pageParams: Array<string | null> } | undefined) => {
          if (!current) {
            return current
          }

          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              items: page.items.map((item) => {
                if (item.id !== postId) {
                  return item
                }

                const likedByMe = !item.likedByMe
                return {
                  ...item,
                  likedByMe,
                  likeCount: likedByMe ? item.likeCount + 1 : Math.max(item.likeCount - 1, 0),
                }
              }),
            })),
          }
        },
      )

      return { previous }
    },
    onError: (_error, _postId, context) => {
      context?.previous.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
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

      return addComment(input)
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
