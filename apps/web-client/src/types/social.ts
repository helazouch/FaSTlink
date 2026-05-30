export interface UserSummary {
  id: number
  fullName: string
  headline: string
  avatarUrl?: string
  online?: boolean
}

export interface CommunitySummary {
  id: number
  name: string
  description: string
  members: number
  coverUrl?: string
}

export interface MyCommunity {
  id: number
  name: string
  description: string
  creatorUserId: number
  role: 'ADMIN' | 'MEMBER'
  createdAt?: string
  lastMessageContent?: string
  lastMessageAt?: string
}

export interface MediaAttachment {
  id: string
  name: string
  mimeType: string
  url: string
}

export interface CommentItem {
  id: string
  author: UserSummary
  content: string
  createdAt: string
}

export interface FeedPost {
  id: string
  author: UserSummary
  entity: string
  communityId: number
  content: string
  media: MediaAttachment[]
  createdAt: string
  likeCount: number
  commentCount: number
  savedCount: number
  shareCount: number
  likedByMe: boolean
  savedByMe: boolean
  comments: CommentItem[]
}

export interface FeedPage {
  items: FeedPost[]
  nextCursor: string | null
}

export interface LocalMediaInput {
  id: string
  name: string
  mimeType: string
  previewUrl: string
  dataUrl?: string
}

export type PublicationScope = 'MY_ENTITY' | 'ALL_ENTITIES' | 'ALL_USERS' | 'SELECTED_ENTITIES'

export interface CreatePostInput {
  content: string
  communityId: number
  entity: string
  author: UserSummary
  media: LocalMediaInput[]
  publishingEntityId: number
  scope: PublicationScope
  selectedEntityIds: number[]
}

export interface CreateCommentInput {
  postId: string
  content: string
  author: UserSummary
}

export type EventParticipation = 'going' | 'interested' | 'not-going'

export interface EventItem {
  id: number
  title: string
  description: string
  location: string
  startsAt: string
  endsAt: string
  capacity: number
  attendees: number
  interestedCount?: number
  communityId: number
  communityName: string
  scope?: PublicationScope
  entiteIds?: number[]
  imageUrl?: string
  category?: string
  participation: EventParticipation | null
}

export interface ServiceRequest {
  id: number
  title: string
  category: string
  description: string
  priority: 'low' | 'medium' | 'high'
  type: 'MATERIAL_REQUEST' | 'ROOM_RESERVATION'
  status: 'submitted' | 'under_review' | 'approved' | 'rejected'
  rawStatus: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
  createdAt: string
  updatedAt: string
  processedAt?: string
  communityId: number
  communityName: string
  requesterUserId: number
  processorUserId?: number
  note?: string
  dateDebut?: string
  dateFin?: string
  heureDebut?: string
  heureFin?: string
  materials: Array<{
    id: number
    typeMateriel: string
    quantite: number
    details?: string
  }>
  rooms: Array<{
    id: number
    capaciteSouhaitee?: number
    nomSalleAttribuee?: string
  }>
}

export interface SubmitRequestInput {
  title: string
  description: string
  communityId: number
  type: 'MATERIAL_REQUEST' | 'ROOM_RESERVATION'
  dateDebut: string
  dateFin: string
  heureDebut: string
  heureFin: string
  typeMateriel?: string
  quantite?: number
  sallesDemandees: Array<{
    capaciteSouhaitee: number
  }>
}

export interface UpdateParticipationInput {
  eventId: number
  participation: EventParticipation
}

export type NotificationKind = 'info' | 'success' | 'warning' | 'alert'

export interface NotificationItem {
  id: string
  kind: NotificationKind
  title: string
  message: string
  createdAt: string
  read: boolean
  actor?: UserSummary
  actionLink?: string
}

export interface ChatMessage {
  id: string
  communityId: number
  sender: UserSummary
  content: string
  createdAt: string
  mine: boolean
}

export interface UserProfile {
  id: number
  fullName: string
  email: string
  headline: string
  bio: string
  location: string
  joinedAt: string
  interests: string[]
  stats: {
    followers: number
    following: number
    posts: number
  }
}
