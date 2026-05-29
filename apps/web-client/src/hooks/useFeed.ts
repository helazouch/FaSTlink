import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { env } from '../config/env'
import { addComment, createPost, getComments, getFeedPage, toggleLike, toggleSavedPost } from '../services/social/feedService'
import { useAuthStore } from '../stores/authStore'
import { useFeedStore } from '../stores/feedStore'
import { SAVED_PUBLICATIONS_QUERY_KEY } from './useSavedPosts'
import type { CommentItem, CreateCommentInput, CreatePostInput, FeedPage, FeedPost } from '../types/social'

const FEED_QUERY_KEY = 'social-feed'
const POST_COMMENTS_QUERY_KEY = 'post-comments'

type InfiniteFeedData = { pages: FeedPage[]; pageParams: Array<string | null> }

const patchPostInPages = (current: InfiniteFeedData | undefined, nextPost: FeedPost) => {
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
  snapshots: Array<[readonly unknown[], InfiniteFeedData | undefined]>,
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

const findPostInCaches = (queryClient: ReturnType<typeof useQueryClient>, postId: string): FeedPost | null => {
  const feedSnapshots = queryClient.getQueriesData<InfiniteFeedData>({
    queryKey: [FEED_QUERY_KEY],
  })
  const feedPost = findPostInPages(feedSnapshots, postId)
  if (feedPost) {
    return feedPost
  }

  const savedSnapshots = queryClient.getQueriesData<InfiniteFeedData>({
    queryKey: [SAVED_PUBLICATIONS_QUERY_KEY],
  })
  return findPostInPages(savedSnapshots, postId)
}

const patchPostInQueryCaches = (queryClient: ReturnType<typeof useQueryClient>, nextPost: FeedPost) => {
  queryClient.setQueriesData({ queryKey: [FEED_QUERY_KEY] }, (current: InfiniteFeedData | undefined) =>
    patchPostInPages(current, nextPost),
  )
  queryClient.setQueriesData({ queryKey: [SAVED_PUBLICATIONS_QUERY_KEY] }, (current: InfiniteFeedData | undefined) => {
    if (!nextPost.savedByMe) {
      if (!current) {
        return current
      }

      return {
        ...current,
        pages: current.pages.map((page) => ({
          ...page,
          items: page.items.filter((item) => item.id !== nextPost.id),
        })),
      }
    }

    return patchPostInPages(current, nextPost)
  })
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

      const post = findPostInCaches(queryClient, postId)
      if (!post) {
        throw new Error('Post not found')
      }

      return toggleLike(post)
    },
    onError: (error) => {
      console.error('Unable to update publication reaction.', error)
    },
    onSuccess: (post) => {
      patchPostInQueryCaches(queryClient, post)
      void queryClient.invalidateQueries({ queryKey: [FEED_QUERY_KEY] })
      void queryClient.invalidateQueries({ queryKey: [SAVED_PUBLICATIONS_QUERY_KEY] })
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
      const patchComments = (current: InfiniteFeedData | undefined) => {
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
      }

      queryClient.setQueriesData({ queryKey: [FEED_QUERY_KEY] }, patchComments)
      queryClient.setQueriesData({ queryKey: [SAVED_PUBLICATIONS_QUERY_KEY] }, patchComments)
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

      const post = findPostInCaches(queryClient, postId)
      if (!post) {
        throw new Error('Post not found')
      }

      return toggleSavedPost(post)
    },
    onError: (error) => {
      console.error('Unable to update saved publication.', error)
    },
    onSuccess: (post) => {
      patchPostInQueryCaches(queryClient, post)
      void queryClient.invalidateQueries({ queryKey: [FEED_QUERY_KEY] })
      void queryClient.invalidateQueries({ queryKey: [SAVED_PUBLICATIONS_QUERY_KEY] })
    },
  })
}
