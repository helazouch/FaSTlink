import { mockFeedPosts } from '../../data/socialMockData'
import { httpClient } from '../api/httpClient'
import { getEntityName, getUserName, hydrateEntityDirectory, hydrateUserDirectory } from '../referenceDataService'
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
  utilisateurId?: number
  entiteIds?: number[]
  communityId?: number
  contenu?: string
  content?: string
  media?: MediaDto[]
  createdAt?: string
  likeCount?: number
  commentCount?: number
  shareCount?: number
  likedByMe?: boolean
  savedByMe?: boolean
}

interface MediaDto {
  id?: string | number
  name?: string
  mimeType?: string
  type?: 'IMAGE' | 'VIDEO' | 'DOCUMENT'
  url: string
}

interface FeedPageDto {
  items: FeedPostDto[]
  nextCursor: string | null
}

interface PublicationResponseDto {
  id: number
  utilisateurId: number
  contenu: string
  entiteIds: number[]
  createdAt?: string
}

interface MediaResponseDto {
  id: number
  url: string
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT'
}

interface CommentaireResponseDto {
  id: number
  utilisateurId: number
  contenu: string
  createdAt?: string
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

const isPersistableUrl = (url: string): boolean => /^https?:\/\//i.test(url)

const mediaTypeFromMime = (mimeType: string): 'IMAGE' | 'VIDEO' | 'DOCUMENT' => {
  const normalized = mimeType.toLowerCase()

  if (normalized.startsWith('image/')) {
    return 'IMAGE'
  }

  if (normalized.startsWith('video/')) {
    return 'VIDEO'
  }

  return 'DOCUMENT'
}

const mimeFromMediaType = (mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT'): string => {
  if (mediaType === 'IMAGE') {
    return 'image/jpeg'
  }

  if (mediaType === 'VIDEO') {
    return 'video/mp4'
  }

  return 'application/octet-stream'
}

const toMedia = (media: MediaDto[] | undefined): MediaAttachment[] =>
  Array.isArray(media)
    ? media.map((item) => ({
        id: String(item.id ?? createId('media')),
        name: item.name ?? 'attachment',
        mimeType: item.mimeType ?? mimeFromMediaType(item.type ?? 'IMAGE'),
        url: item.url,
      }))
    : []

const mapPost = (payload: FeedPostDto): FeedPost => ({
  id: String(payload.id),
  author: {
    id: payload.utilisateurId ?? 0,
    fullName: payload.utilisateurId ? getUserName(payload.utilisateurId) : 'Unknown member',
    headline: 'FaST Link member',
  },
  entity: payload.entiteIds?.[0] ? getEntityName(payload.entiteIds[0]) : 'FaST Link',
  communityId: payload.communityId ?? payload.entiteIds?.[0] ?? 1,
  content: payload.content ?? payload.contenu ?? '',
  media: toMedia(payload.media),
  createdAt: payload.createdAt ?? new Date().toISOString(),
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

const mergeServerPosts = (posts: FeedPost[]): void => {
  if (posts.length === 0) {
    return
  }

  const byId = new Map<string, FeedPost>()

  posts.forEach((post) => {
    byId.set(post.id, post)
  })

  feedCache.forEach((post) => {
    if (!byId.has(post.id)) {
      byId.set(post.id, post)
    }
  })

  feedCache = Array.from(byId.values()).sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  )
}

const updateFeedPost = (postId: string, transform: (post: FeedPost) => FeedPost): FeedPost => {
  let updated: FeedPost | null = null

  feedCache = feedCache.map((item) => {
    if (item.id !== postId) {
      return item
    }

    updated = transform(item)
    return updated
  })

  if (!updated) {
    throw new Error('Post not found')
  }

  return updated
}

export const getFeedPage = async (
  cursor: string | null,
  limit: number,
  communityId: number | null,
  searchQuery: string,
): Promise<FeedPage> =>
  withFallback(
    async () => {
      const response = await httpClient.get<FeedPageDto | FeedPostDto[]>('/v1/publications', {
        params: {
          cursor,
          limit,
          communityId: communityId ?? undefined,
          query: searchQuery.trim() || undefined,
        },
      })

      const serverItems = Array.isArray(response.data) ? response.data : response.data.items
      const userIds = serverItems
        .map((item) => item.utilisateurId ?? 0)
        .filter((id) => id > 0)
      await Promise.all([hydrateUserDirectory(userIds), hydrateEntityDirectory()])
      mergeServerPosts(serverItems.map(mapPost))

      return getFallbackPage(cursor, limit, communityId, searchQuery)
    },
    () => getFallbackPage(cursor, limit, communityId, searchQuery),
  )

export const createPost = async (input: CreatePostInput): Promise<FeedPost> =>
  withFallback(
    async () => {
      const publicationResponse = await httpClient.post<PublicationResponseDto>('/v1/publications', {
        utilisateurId: input.author.id,
        contenu: input.content,
        entiteIds: [input.communityId],
      })

      const persistedMedia: MediaAttachment[] = []

      for (const item of input.media) {
        if (!isPersistableUrl(item.previewUrl)) {
          continue
        }

        try {
          const mediaResponse = await httpClient.post<MediaResponseDto>(
            `/v1/publications/${publicationResponse.data.id}/medias`,
            {
              utilisateurId: input.author.id,
              url: item.previewUrl,
              type: mediaTypeFromMime(item.mimeType),
            },
          )

          persistedMedia.push({
            id: String(mediaResponse.data.id),
            name: item.name,
            mimeType: mimeFromMediaType(mediaResponse.data.type),
            url: mediaResponse.data.url,
          })
        } catch {
          // Keep post creation successful even if a media URL cannot be persisted.
        }
      }

      const post: FeedPost = {
        id: String(publicationResponse.data.id),
        author: input.author,
        entity: input.entity,
        communityId: publicationResponse.data.entiteIds?.[0] ?? input.communityId,
        content: publicationResponse.data.contenu,
        media:
          persistedMedia.length > 0
            ? persistedMedia
            : input.media.map((item) => ({
                id: item.id,
                name: item.name,
                mimeType: item.mimeType,
                url: item.previewUrl,
              })),
        createdAt: publicationResponse.data.createdAt ?? new Date().toISOString(),
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

export const toggleLike = async (postId: string, userId: number): Promise<FeedPost> =>
  withFallback(
    async () => {
      const currentPost = feedCache.find((item) => item.id === postId)
      if (!currentPost) {
        throw new Error('Post not found')
      }

      const shouldLike = !currentPost.likedByMe

      if (shouldLike) {
        await httpClient.post(`/v1/publications/${postId}/reactions`, {
          utilisateurId: userId,
          type: 'LIKE',
        })
      }

      return updateFeedPost(postId, (post) => ({
        ...post,
        likedByMe: shouldLike,
        likeCount: shouldLike ? post.likeCount + 1 : Math.max(post.likeCount - 1, 0),
      }))
    },
    () =>
      updateFeedPost(postId, (post) => {
        const likedByMe = !post.likedByMe

        return {
          ...post,
          likedByMe,
          likeCount: likedByMe ? post.likeCount + 1 : Math.max(post.likeCount - 1, 0),
        }
      }),
  )

export const addComment = async (input: CreateCommentInput, userId: number): Promise<FeedPost> =>
  withFallback(
    async () => {
      const response = await httpClient.post<CommentaireResponseDto>(
        `/v1/publications/${input.postId}/commentaires`,
        {
          utilisateurId: userId,
          contenu: input.content,
        },
      )

      return updateFeedPost(input.postId, (post) => {
        const nextComments = [
          ...post.comments,
          {
            id: String(response.data.id),
            author: {
              ...input.author,
              id: response.data.utilisateurId,
            },
            content: response.data.contenu,
            createdAt: response.data.createdAt ?? new Date().toISOString(),
          },
        ]

        return {
          ...post,
          comments: nextComments,
          commentCount: nextComments.length,
        }
      })
    },
    () =>
      updateFeedPost(input.postId, (post) => {
        const nextComments = [
          ...post.comments,
          {
            id: createId('comment'),
            author: input.author,
            content: input.content,
            createdAt: new Date().toISOString(),
          },
        ]

        return {
          ...post,
          comments: nextComments,
          commentCount: nextComments.length,
        }
      }),
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
