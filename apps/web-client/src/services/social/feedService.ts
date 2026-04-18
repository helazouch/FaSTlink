import { mockFeedPosts } from '../../data/socialMockData'
import { httpClient } from '../api/httpClient'
import { withFallback } from './fallback'
import type {
  CreateCommentInput,
  CreatePostInput,
  FeedPage,
  FeedPost,
  MediaAttachment,
} from '../../types/social'

interface FeedPostDto {
  id: string | number
  author?: {
    id: number
    fullName?: string
    nomComplet?: string
    headline?: string
  }
  entity?: string
  communityId?: number
  contenu?: string
  content?: string
  media?: Array<{
    id?: string
    name?: string
    mimeType?: string
    url: string
  }>
  createdAt: string
  likeCount?: number
  commentCount?: number
  shareCount?: number
  likedByMe?: boolean
  savedByMe?: boolean
}

interface FeedPageDto {
  items: FeedPostDto[]
  nextCursor: string | null
}

let feedCache: FeedPost[] = mockFeedPosts.map((item) => ({
  ...item,
  comments: [...item.comments],
  media: [...item.media],
}))

const createId = (prefix: string): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const toMedia = (
  media: FeedPostDto['media'] | undefined,
): MediaAttachment[] =>
  Array.isArray(media)
    ? media.map((item) => ({
        id: item.id ?? createId('media'),
        name: item.name ?? 'attachment',
        mimeType: item.mimeType ?? 'image/jpeg',
        url: item.url,
      }))
    : []

const mapPost = (payload: FeedPostDto): FeedPost => ({
  id: String(payload.id),
  author: {
    id: payload.author?.id ?? 0,
    fullName: payload.author?.fullName ?? payload.author?.nomComplet ?? 'Unknown member',
    headline: payload.author?.headline ?? 'FaST Link member',
  },
  entity: payload.entity ?? 'FaST Link',
  communityId: payload.communityId ?? 1,
  content: payload.content ?? payload.contenu ?? '',
  media: toMedia(payload.media),
  createdAt: payload.createdAt,
  likeCount: payload.likeCount ?? 0,
  commentCount: payload.commentCount ?? 0,
  shareCount: payload.shareCount ?? 0,
  likedByMe: Boolean(payload.likedByMe),
  savedByMe: Boolean(payload.savedByMe),
  comments: [],
})

const getFallbackPage = (
  cursor: string | null,
  limit: number,
  communityId: number | null,
  searchQuery: string,
): FeedPage => {
  const start = cursor ? Number(cursor) : 0
  const normalizedSearch = searchQuery.trim().toLowerCase()

  const filtered = feedCache.filter((item) => {
    const inCommunity = communityId === null || item.communityId === communityId
    const inSearch =
      normalizedSearch.length === 0 ||
      item.content.toLowerCase().includes(normalizedSearch) ||
      item.author.fullName.toLowerCase().includes(normalizedSearch) ||
      item.entity.toLowerCase().includes(normalizedSearch)

    return inCommunity && inSearch
  })

  const items = filtered.slice(start, start + limit)
  const nextStart = start + items.length

  return {
    items,
    nextCursor: nextStart < filtered.length ? String(nextStart) : null,
  }
}

export const getFeedPage = async (
  cursor: string | null,
  limit: number,
  communityId: number | null,
  searchQuery: string,
): Promise<FeedPage> =>
  withFallback(
    async () => {
      const response = await httpClient.get<FeedPageDto>('/v1/feed/posts', {
        params: {
          cursor,
          limit,
          communityId: communityId ?? undefined,
          query: searchQuery.trim() || undefined,
        },
      })

      return {
        items: response.data.items.map(mapPost),
        nextCursor: response.data.nextCursor,
      }
    },
    () => getFallbackPage(cursor, limit, communityId, searchQuery),
  )

export const createPost = async (input: CreatePostInput): Promise<FeedPost> =>
  withFallback(
    async () => {
      const response = await httpClient.post<FeedPostDto>('/v1/feed/posts', {
        communityId: input.communityId,
        entity: input.entity,
        content: input.content,
        media: input.media,
      })

      return mapPost(response.data)
    },
    () => {
      const post: FeedPost = {
        id: createId('post'),
        author: input.author,
        entity: input.entity,
        communityId: input.communityId,
        content: input.content,
        media: input.media.map((item) => ({
          id: item.id,
          name: item.name,
          mimeType: item.mimeType,
          url: item.previewUrl,
        })),
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
        likedByMe: false,
        savedByMe: false,
        comments: [],
      }

      feedCache = [post, ...feedCache]
      return post
    },
  )

export const toggleLike = async (postId: string): Promise<FeedPost> =>
  withFallback(
    async () => {
      const response = await httpClient.post<FeedPostDto>(`/v1/feed/posts/${postId}/like`)
      return mapPost(response.data)
    },
    () => {
      let updated: FeedPost | null = null

      feedCache = feedCache.map((item) => {
        if (item.id !== postId) {
          return item
        }

        const likedByMe = !item.likedByMe
        const likeCount = likedByMe ? item.likeCount + 1 : Math.max(item.likeCount - 1, 0)
        updated = {
          ...item,
          likedByMe,
          likeCount,
        }
        return updated
      })

      if (!updated) {
        throw new Error('Post not found')
      }

      return updated
    },
  )

export const addComment = async (input: CreateCommentInput): Promise<FeedPost> =>
  withFallback(
    async () => {
      const response = await httpClient.post<FeedPostDto>(
        `/v1/feed/posts/${input.postId}/comments`,
        {
          content: input.content,
        },
      )

      return mapPost(response.data)
    },
    () => {
      let updated: FeedPost | null = null

      feedCache = feedCache.map((item) => {
        if (item.id !== input.postId) {
          return item
        }

        const nextComments = [
          ...item.comments,
          {
            id: createId('comment'),
            author: input.author,
            content: input.content,
            createdAt: new Date().toISOString(),
          },
        ]

        updated = {
          ...item,
          comments: nextComments,
          commentCount: nextComments.length,
        }

        return updated
      })

      if (!updated) {
        throw new Error('Post not found')
      }

      return updated
    },
  )

export const toggleSavedPost = (postId: string): FeedPost | null => {
  let updated: FeedPost | null = null

  feedCache = feedCache.map((item) => {
    if (item.id !== postId) {
      return item
    }

    updated = {
      ...item,
      savedByMe: !item.savedByMe,
    }

    return updated
  })

  return updated
}
