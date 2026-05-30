import { getEntityName, getUserName, hydrateEntityDirectory, hydrateUserDirectory } from './referenceDataService'
import type {
  CreateEventInput,
  CreatePublicationInput,
  DashboardSummary,
  EventItem,
  NotificationItem,
  NotificationType,
  Publication,
} from '../types/domain'
import { httpClient } from './api/httpClient'

interface AnalyticsSnapshotResponse {
  id: number
  entiteId: number
  interactions: number
  participation: number
  engagement: number
  sourceEventId: string | null
  sourceEventType: string | null
  payloadJson: string | null
  occurredAt: string
  createdAt: string
}

interface AdminGlobalStatsResponse {
  totalGlobalConfigs: number
  totalPlatformSettings: number
  enabledPlatformSettings: number
  disabledPlatformSettings: number
  lastGlobalConfigUpdatedAt: string | null
  lastPlatformSettingUpdatedAt: string | null
  computedAt: string
}

interface PublicationResponse {
  id: number
  utilisateurId: number
  contenu: string
  entiteIds: number[]
  createdAt: string
  updatedAt: string
}

interface EventResponse {
  id: number
  entiteId: number
  createurUtilisateurId: number
  titre: string
  description: string | null
  lieu: string | null
  debutAt: string
  finAt: string
  createdAt: string
  updatedAt: string
}

interface NotificationResponse {
  notificationId: number
  utilisateurId: number
  lu: boolean
  luAt: string | null
  type: string
  titre: string
  contenu: string
  payloadJson: string | null
  sourceEventId: string | null
  createdAt: string
}

const ENDPOINTS = {
  adminGlobalStats: '/v1/admin/stats/global',
  analyticsLatest: (entityId: number) => `/v1/analytics/entities/${entityId}/latest`,
  analyticsSnapshots: (entityId: number, limit = 8) =>
    `/v1/analytics/entities/${entityId}/snapshots?limit=${limit}`,
  publications: '/v1/publications',
  events: '/v1/events',
  notifications: (userId: number) => `/v1/notifications?utilisateurId=${userId}`,
  markNotificationRead: (notificationId: number, userId: number) =>
    `/v1/notifications/${notificationId}/read?utilisateurId=${userId}`,
}

const toNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim().length > 0) {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return fallback
}

const computeTimeline = (snapshots: AnalyticsSnapshotResponse[]): number[] => {
  const normalized = snapshots.slice(-8).map((s) => toNumber(s.interactions, 0))
  // Return whatever we have; the chart will display real data only
  while (normalized.length < 8) normalized.unshift(0)
  return normalized
}

const computeGrowthRate = (timeline: number[]): number => {
  const first = timeline[0] ?? 0
  const last = timeline[timeline.length - 1] ?? 0
  if (first <= 0) return 0
  return Number((((last - first) / first) * 100).toFixed(1))
}

const normalizeNotificationType = (type: string): NotificationType => {
  const t = type.trim().toLowerCase()
  if (t.includes('success')) return 'success'
  if (t.includes('warn')) return 'warning'
  if (t.includes('alert') || t.includes('error')) return 'alert'
  return 'info'
}

const mapNotification = (payload: NotificationResponse): NotificationItem => ({
  id: String(payload.notificationId),
  type: normalizeNotificationType(payload.type),
  title: payload.titre,
  message: payload.contenu,
  createdAt: payload.createdAt,
  read: payload.lu,
  actionLabel: payload.sourceEventId ? 'Open source event' : undefined,
})

const mapPublication = (payload: PublicationResponse): Publication => {
  const excerpt = payload.contenu.trim()
  const title = excerpt.length <= 72 ? excerpt : `${excerpt.slice(0, 72)}...`
  return {
    id: String(payload.id),
    author: getUserName(payload.utilisateurId, `User #${payload.utilisateurId}`),
    community:
      payload.entiteIds.length > 0
        ? getEntityName(payload.entiteIds[0], `Entity #${payload.entiteIds[0]}`)
        : 'General',
    title,
    excerpt,
    createdAt: payload.createdAt,
    reactions: 0,
    comments: 0,
    tags: payload.entiteIds.slice(0, 3).map((id) => `Entity-${id}`),
  }
}

const mapEvent = (payload: EventResponse): EventItem => {
  const now = Date.now()
  const endsAt = Date.parse(payload.finAt)
  const startsAt = Date.parse(payload.debutAt)

  const status: EventItem['status'] =
    Number.isFinite(endsAt) && endsAt < now
      ? 'closed'
      : Number.isFinite(startsAt) && startsAt > now
        ? 'open'
        : 'draft'

  return {
    id: String(payload.id),
    title: payload.titre,
    community: getEntityName(payload.entiteId, `Entity #${payload.entiteId}`),
    startsAt: payload.debutAt,
    location: payload.lieu ?? 'Location TBD',
    attendees: 0,
    capacity: 0,
    status,
    description: payload.description ?? '',
  }
}

export const getDashboardSummary = async (entityId: number): Promise<DashboardSummary> => {
  const [globalStatsResult, latestResult, snapshotsResult] = await Promise.allSettled([
    httpClient.get<AdminGlobalStatsResponse>(ENDPOINTS.adminGlobalStats),
    httpClient.get<AnalyticsSnapshotResponse>(ENDPOINTS.analyticsLatest(entityId)),
    httpClient.get<AnalyticsSnapshotResponse[]>(ENDPOINTS.analyticsSnapshots(entityId)),
  ])

  const globalStats =
    globalStatsResult.status === 'fulfilled' ? globalStatsResult.value.data : null
  const latestSnapshot =
    latestResult.status === 'fulfilled' ? latestResult.value.data : null
  const snapshots =
    snapshotsResult.status === 'fulfilled' && Array.isArray(snapshotsResult.value.data)
      ? snapshotsResult.value.data
      : []

  const timeline = computeTimeline(snapshots)

  return {
    totalMembers: toNumber(latestSnapshot?.participation, 0),
    activeCommunities: toNumber(globalStats?.totalPlatformSettings, 0),
    weeklyEvents: toNumber(globalStats?.enabledPlatformSettings, 0),
    publicationsToday: toNumber(latestSnapshot?.interactions, 0),
    growthRate: computeGrowthRate(timeline),
    engagementRate: toNumber(latestSnapshot?.engagement, 0),
    activeNow: toNumber(latestSnapshot?.participation, 0),
    activityTimeline: timeline,
  }
}

export const getPublications = async (): Promise<Publication[]> => {
  const response = await httpClient.get<PublicationResponse[]>(ENDPOINTS.publications)

  if (!Array.isArray(response.data)) {
    throw new Error('Invalid publication list payload')
  }

  await Promise.all([
    hydrateUserDirectory(response.data.map((item) => item.utilisateurId)),
    hydrateEntityDirectory(),
  ])

  return response.data.map(mapPublication)
}

export const createPublication = async (
  payload: CreatePublicationInput,
): Promise<Publication> => {
  const response = await httpClient.post<PublicationResponse>(ENDPOINTS.publications, {
    utilisateurId: payload.userId,
    contenu: payload.content,
    entiteIds: payload.entityIds,
  })
  return mapPublication(response.data)
}

export const getEvents = async (): Promise<EventItem[]> => {
  const response = await httpClient.get<EventResponse[]>(ENDPOINTS.events)

  if (!Array.isArray(response.data)) {
    throw new Error('Invalid events payload')
  }

  await hydrateEntityDirectory()
  return response.data.map(mapEvent)
}

export const createEvent = async (payload: CreateEventInput): Promise<EventItem> => {
  const response = await httpClient.post<EventResponse>(ENDPOINTS.events, {
    utilisateurId: payload.userId,
    entiteId: payload.entityId,
    titre: payload.title,
    description: payload.description,
    lieu: payload.location,
    debutAt: payload.startsAt,
    finAt: payload.endsAt,
  })
  return mapEvent(response.data)
}

export const getNotifications = async (userId: number): Promise<NotificationItem[]> => {
  const response = await httpClient.get<NotificationResponse[]>(
    ENDPOINTS.notifications(userId),
  )

  if (!Array.isArray(response.data)) {
    throw new Error('Invalid notifications payload')
  }

  return response.data.map(mapNotification)
}

export const markNotificationAsRead = async (
  notificationId: number,
  userId: number,
): Promise<NotificationItem> => {
  const response = await httpClient.post<NotificationResponse>(
    ENDPOINTS.markNotificationRead(notificationId, userId),
  )
  return mapNotification(response.data)
}
