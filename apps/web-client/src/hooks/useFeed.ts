import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { env } from '../config/env'
import { addComment, createPost, getComments, getFeedPage, toggleLike, toggleSavedPost } from '../services/social/feedService'
import { useAuthStore } from '../stores/authStore'
import { useFeedStore } from '../stores/feedStore'
import type { CommentItem, CreateCommentInput, CreatePostInput, FeedPage, FeedPost } from '../types/social'

const FEED_QUERY_KEY = 'social-feed'
const POST_COMMENTS_QUERY_KEY = 'post-comments'

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

const findPostInPages = (
  snapshots: Array<[readonly unknown[], { pages: FeedPage[]; pageParams: Array<string | null> } | undefined]>,
  postId: string,
): FeedPost | null => {
  for (const [, data] of snapshots) {
    for (const page of data?.pages ?? []) {
      const post = page.items.find((item) => item.id === postId)
      if (post) {
        return post
      }
    }
  }

  return null
}

export const useInfiniteFeed = () => {
  const searchQuery = useFeedStore((state) => state.searchQuery)
  const activeCommunityId = useFeedStore((state) => state.activeCommunityId)
  const userId = useAuthStore((state) => state.user?.id ?? null)

  return useInfiniteQuery({
    queryKey: [FEED_QUERY_KEY, userId, searchQuery, activeCommunityId],
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

      const snapshots = queryClient.getQueriesData<{ pages: FeedPage[]; pageParams: Array<string | null> }>({
        queryKey: [FEED_QUERY_KEY],
      })
      const post = findPostInPages(snapshots, postId)
      if (!post) {
        throw new Error('Post not found')
      }

      return toggleLike(post)
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
    onSuccess: (comment, input) => {
      queryClient.setQueryData<CommentItem[]>(
        [POST_COMMENTS_QUERY_KEY, userId, input.postId],
        (current) => (current ? [...current, comment] : [comment]),
      )
      queryClient.setQueriesData(
        {
          queryKey: [FEED_QUERY_KEY],
        },
        (current: { pages: FeedPage[]; pageParams: Array<string | null> } | undefined) => {
          if (!current) {
            return current
          }

          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              items: page.items.map((item) =>
                item.id === input.postId
                  ? {
                      ...item,
                      comments: [...item.comments, comment],
                      commentCount: item.commentCount + 1,
                    }
                  : item,
              ),
            })),
          }
        },
      )
      void queryClient.invalidateQueries({ queryKey: [POST_COMMENTS_QUERY_KEY, userId, input.postId] })
    },
  })
}

export const usePostComments = (postId: string, enabled: boolean) => {
  const userId = useAuthStore((state) => state.user?.id ?? null)

  return useQuery({
    queryKey: [POST_COMMENTS_QUERY_KEY, userId, postId],
    queryFn: () => getComments(postId),
    enabled: enabled && Boolean(userId),
    staleTime: 5_000,
  })
}

export const useToggleSavedPost = () => {
  const queryClient = useQueryClient()
  const userId = useAuthStore((state) => state.user?.id)

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!userId) {
        throw new Error('You must be signed in to save a post')
      }

      const snapshots = queryClient.getQueriesData<{ pages: FeedPage[]; pageParams: Array<string | null> }>({
        queryKey: [FEED_QUERY_KEY],
      })
      const post = findPostInPages(snapshots, postId)
      if (!post) {
        throw new Error('Post not found')
      }

      return toggleSavedPost(post)
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

                const savedByMe = !item.savedByMe
                return {
                  ...item,
                  savedByMe,
                  savedCount: savedByMe ? item.savedCount + 1 : Math.max(item.savedCount - 1, 0),
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
