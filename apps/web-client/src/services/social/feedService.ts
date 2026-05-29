import { httpClient } from '../api/httpClient'
import { getEntityName, getUserName, hydrateEntityDirectory, hydrateUserDirectory } from '../referenceDataService'
import type {
  CommentItem,
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
  publishingEntityId?: number
  communityId?: number
  contenu?: string
  content?: string
  media?: MediaDto[]
  createdAt?: string
  likeCount?: number
  likesCount?: number
  commentCount?: number
  commentsCount?: number
  savedCount?: number
  shareCount?: number
  likedByMe?: boolean
  likedByCurrentUser?: boolean
  savedByMe?: boolean
  savedByCurrentUser?: boolean
}

interface MediaDto {
  id?: string | number
  name?: string
  mimeType?: string
  type?: 'IMAGE' | 'VIDEO' | 'DOCUMENT'
  url: string
}

interface FeedPageDto {
  items?: FeedPostDto[]
  nextCursor?: string | null
  content?: FeedPostDto[]
  last?: boolean
  number?: number
}

interface PublicationResponseDto {
  id: number
  utilisateurId: number
  contenu: string
  publishingEntityId?: number
  entiteIds: number[]
  media?: MediaDto[]
  likesCount?: number
  commentsCount?: number
  savedCount?: number
  likedByCurrentUser?: boolean
  savedByCurrentUser?: boolean
  createdAt?: string
}

interface CommentaireResponseDto {
  id: number
  utilisateurId: number
  contenu: string
  createdAt?: string
}

const createId = (prefix: string): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

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
  entity: payload.publishingEntityId
    ? getEntityName(payload.publishingEntityId)
    : payload.entiteIds?.[0]
      ? getEntityName(payload.entiteIds[0])
      : 'FaST Link',
  communityId: payload.communityId ?? payload.publishingEntityId ?? payload.entiteIds?.[0] ?? 0,
  content: payload.content ?? payload.contenu ?? '',
  media: toMedia(payload.media),
  createdAt: payload.createdAt ?? new Date().toISOString(),
  likeCount: payload.likesCount ?? payload.likeCount ?? 0,
  commentCount: payload.commentsCount ?? payload.commentCount ?? 0,
  savedCount: payload.savedCount ?? 0,
  shareCount: payload.shareCount ?? 0,
  likedByMe: Boolean(payload.likedByCurrentUser ?? payload.likedByMe),
  savedByMe: Boolean(payload.savedByCurrentUser ?? payload.savedByMe),
  comments: [],
})

const toComment = (payload: CommentaireResponseDto): CommentItem => ({
  id: String(payload.id),
  author: {
    id: payload.utilisateurId,
    fullName: getUserName(payload.utilisateurId),
    headline: 'FaST Link member',
  },
  content: payload.contenu,
  createdAt: payload.createdAt ?? new Date().toISOString(),
})

export const resetFeedCache = (): void => undefined

export const getFeedPage = async (
  cursor: string | null,
  limit: number,
  communityId: number | null,
  searchQuery: string,
): Promise<FeedPage> => {
  const pageNumber = cursor ? Number(cursor) : 0
  const response = await httpClient.get<FeedPageDto | FeedPostDto[]>('/v1/publications/feed', {
    params: {
      page: pageNumber,
      size: limit,
    },
  })

  const serverItems = Array.isArray(response.data)
    ? response.data
    : response.data.items ?? response.data.content ?? []
  const userIds = serverItems.map((item) => item.utilisateurId ?? 0).filter((id) => id > 0)
  await Promise.all([hydrateUserDirectory(userIds), hydrateEntityDirectory()])

  const normalizedSearch = searchQuery.trim().toLowerCase()
  const items = serverItems.map(mapPost).filter((item) => {
    const inCommunity = communityId === null || item.communityId === communityId
    const inSearch =
      normalizedSearch.length === 0 ||
      item.content.toLowerCase().includes(normalizedSearch) ||
      item.author.fullName.toLowerCase().includes(normalizedSearch) ||
      item.entity.toLowerCase().includes(normalizedSearch)

    return inCommunity && inSearch
  })

  return {
    items,
    nextCursor: !Array.isArray(response.data) && response.data.last === false ? String(pageNumber + 1) : null,
  }
}

export const createPost = async (input: CreatePostInput): Promise<FeedPost> => {
  const publicationResponse = await httpClient.post<PublicationResponseDto>('/v1/publications', {
    contenu: input.content,
    publishingEntityId: input.publishingEntityId,
    scope: input.scope,
    selectedEntityIds: input.selectedEntityIds,
    media: input.media.map((item) => ({
      url: item.dataUrl ?? item.previewUrl,
      type: mediaTypeFromMime(item.mimeType),
    })),
  })

  const persistedMedia = toMedia(publicationResponse.data.media)

  return {
    id: String(publicationResponse.data.id),
    author: input.author,
    entity: input.entity,
    communityId: publicationResponse.data.publishingEntityId ?? publicationResponse.data.entiteIds?.[0] ?? input.communityId,
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
    likeCount: publicationResponse.data.likesCount ?? 0,
    commentCount: publicationResponse.data.commentsCount ?? 0,
    savedCount: publicationResponse.data.savedCount ?? 0,
    shareCount: 0,
    likedByMe: Boolean(publicationResponse.data.likedByCurrentUser),
    savedByMe: Boolean(publicationResponse.data.savedByCurrentUser),
    comments: [],
  }
}

export const toggleLike = async (post: FeedPost): Promise<FeedPost> => {
  const shouldLike = !post.likedByMe

  if (shouldLike) {
    await httpClient.post(`/v1/publications/${post.id}/reactions`, {
      type: 'LIKE',
    })
  } else {
    await httpClient.delete(`/v1/publications/${post.id}/reactions`)
  }

  return {
    ...post,
    likedByMe: shouldLike,
    likeCount: shouldLike ? post.likeCount + 1 : Math.max(post.likeCount - 1, 0),
  }
}

export const getComments = async (postId: string): Promise<CommentItem[]> => {
  const response = await httpClient.get<CommentaireResponseDto[]>(`/v1/publications/${postId}/comments`)
  const userIds = response.data.map((item) => item.utilisateurId)
  await hydrateUserDirectory(userIds)
  return response.data.map(toComment)
}

export const addComment = async (input: CreateCommentInput): Promise<CommentItem> => {
  const response = await httpClient.post<CommentaireResponseDto>(
    `/v1/publications/${input.postId}/commentaires`,
    {
      contenu: input.content,
    },
  )

  await hydrateUserDirectory([response.data.utilisateurId])
  return toComment(response.data)
}

export const toggleSavedPost = async (post: FeedPost): Promise<FeedPost> => {
  const shouldSave = !post.savedByMe

  if (shouldSave) {
    await httpClient.post(`/v1/publications/${post.id}/save`)
  } else {
    await httpClient.delete(`/v1/publications/${post.id}/save`)
  }

  return {
    ...post,
    savedByMe: shouldSave,
    savedCount: shouldSave ? post.savedCount + 1 : Math.max(post.savedCount - 1, 0),
  }
}
