import { httpClient } from '../api/httpClient'
import { getEntityName, getUserName, hydrateEntityDirectory, hydrateUserDirectory } from '../referenceDataService'
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

let feedCache: FeedPost[] = []

const createId = (prefix: string): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const isPersistableUrl = (url: string): boolean => /^https?:\/\//i.test(url)

const mediaTypeFromMime = (mimeType: string): 'IMAGE' | 'VIDEO' | 'DOCUMENT' => {
  const normalized = mimeType.toLowerCase()
  if (normalized.startsWith('image/')) return 'IMAGE'
  if (normalized.startsWith('video/')) return 'VIDEO'
  return 'DOCUMENT'
}

const mimeFromMediaType = (mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT'): string => {
  if (mediaType === 'IMAGE') return 'image/jpeg'
  if (mediaType === 'VIDEO') return 'video/mp4'
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
  communityId: payload.communityId ?? payload.entiteIds?.[0] ?? 0,
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

const buildServerPage = (
  posts: FeedPost[],
  cursor: string | null,
  limit: number,
  communityId: number | null,
  searchQuery: string,
): FeedPage => {
  const start = cursor ? Number(cursor) : 0
  const normalized = searchQuery.trim().toLowerCase()

  const filtered = posts.filter((item) => {
    const inCommunity = communityId === null || item.communityId === communityId
    const inSearch =
      normalized.length === 0 ||
      item.content.toLowerCase().includes(normalized) ||
      item.author.fullName.toLowerCase().includes(normalized) ||
      item.entity.toLowerCase().includes(normalized)
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
): Promise<FeedPage> => {
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
  // allSettled: name-resolution failures must never block the feed
  await Promise.allSettled([hydrateUserDirectory(userIds), hydrateEntityDirectory()])

  const mapped = serverItems.map(mapPost)
  feedCache = mapped

  return buildServerPage(feedCache, cursor, limit, communityId, searchQuery)
}

export const createPost = async (input: CreatePostInput): Promise<FeedPost> => {
  // entiteIds is optional on the backend: send only when the user explicitly targets an entity.
  // An empty array means a general (unaffiliated) publication — no entity permission check.
  const entiteIds = input.communityId && input.communityId > 0 ? [input.communityId] : []

  const publicationResponse = await httpClient.post<PublicationResponseDto>('/v1/publications', {
    utilisateurId: input.author.id,
    contenu: input.content,
    entiteIds,
  })

  const persistedMedia: MediaAttachment[] = []

  for (const item of input.media) {
    if (!isPersistableUrl(item.previewUrl)) continue

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
      // Media upload failure should not block post creation
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
}

export const toggleLike = async (postId: string, userId: number): Promise<FeedPost> => {
  const currentPost = feedCache.find((item) => item.id === postId)
  if (!currentPost) throw new Error('Post not found')

  const shouldLike = !currentPost.likedByMe

  if (shouldLike) {
    await httpClient.post(`/v1/publications/${postId}/reactions`, {
      utilisateurId: userId,
      type: 'LIKE',
    })
  }

  let updated: FeedPost | null = null
  feedCache = feedCache.map((item) => {
    if (item.id !== postId) return item
    updated = {
      ...item,
      likedByMe: shouldLike,
      likeCount: shouldLike ? item.likeCount + 1 : Math.max(item.likeCount - 1, 0),
    }
    return updated
  })

  if (!updated) throw new Error('Post not found after update')
  return updated
}

export const addComment = async (input: CreateCommentInput, userId: number): Promise<FeedPost> => {
  const response = await httpClient.post<CommentaireResponseDto>(
    `/v1/publications/${input.postId}/commentaires`,
    {
      utilisateurId: userId,
      contenu: input.content,
    },
  )

  let updated: FeedPost | null = null
  feedCache = feedCache.map((item) => {
    if (item.id !== input.postId) return item
    const nextComments = [
      ...item.comments,
      {
        id: String(response.data.id),
        author: { ...input.author, id: response.data.utilisateurId },
        content: response.data.contenu,
        createdAt: response.data.createdAt ?? new Date().toISOString(),
      },
    ]
    updated = { ...item, comments: nextComments, commentCount: nextComments.length }
    return updated
  })

  if (!updated) throw new Error('Post not found after comment')
  return updated
}

// Saved state is managed locally since the backend has no /saved endpoint yet.
// The savedByMe flag persists only for the current session.
export const toggleSavedPost = (postId: string): FeedPost | null => {
  let updated: FeedPost | null = null

  feedCache = feedCache.map((item) => {
    if (item.id !== postId) return item
    updated = { ...item, savedByMe: !item.savedByMe }
    return updated
  })

  return updated
}
