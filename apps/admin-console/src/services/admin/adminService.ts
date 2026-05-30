import { env, resolvePathTemplate } from '../../config/env'
import { normalizePagedResult } from '../../lib/paged'
import { asArray, asObject, toBoolean, toNumber, toStringValue } from '../../lib/parse'
import type {
  AdminGlobalStats,
  AdminUser,
  AnalyticsSnapshot,
  AuditLogEntry,
  GlobalConfig,
  ModerationItem,
  NotificationItem,
  PagedResult,
  PlatformSetting,
  CommunityMetrics,
  EntityDistribution,
  EventMetrics,
  MetricPoint,
  PlatformOverview,
  PublicationMetrics,
  RequestMetrics,
  RoleOption,
} from '../../types/domain'
import { httpClient } from '../api/httpClient'

const mapAnalyticsSnapshot = (item: unknown): AnalyticsSnapshot => {
  const payload = asObject(item)

  return {
    id: toNumber(payload.id),
    entiteId: toNumber(payload.entiteId),
    interactions: toNumber(payload.interactions),
    participation: toNumber(payload.participation),
    engagement: toNumber(payload.engagement),
    sourceEventId: toStringValue(payload.sourceEventId, '') || null,
    sourceEventType: toStringValue(payload.sourceEventType, '') || null,
    payloadJson: toStringValue(payload.payloadJson, '') || null,
    occurredAt: toStringValue(payload.occurredAt),
    createdAt: toStringValue(payload.createdAt),
  }
}

const mapRole = (item: unknown): RoleOption => {
  const payload = asObject(item)
  return {
    id: toNumber(payload.id),
    name: toStringValue(payload.name, 'USER'),
  }
}

const mapAdminUser = (item: unknown): AdminUser => {
  const payload = asObject(item)
  const roles = asArray<string>(payload.roles)

  return {
    id: toNumber(payload.id),
    fullName: toStringValue(payload.nomComplet ?? payload.fullName, `User #${toNumber(payload.id)}`),
    email: toStringValue(payload.email, 'unknown@fastlink.local'),
    roles,
    enabled: toBoolean(payload.enabled, true),
    createdAt: toStringValue(payload.createdAt, '') || null,
    updatedAt: toStringValue(payload.updatedAt, '') || null,
  }
}

const mapSetting = (item: unknown): PlatformSetting => {
  const payload = asObject(item)

  return {
    id: toNumber(payload.id),
    settingKey: toStringValue(payload.settingKey),
    settingValue: toStringValue(payload.settingValue),
    enabled: toBoolean(payload.enabled),
    description: toStringValue(payload.description, '') || null,
    updatedByUserId: toNumber(payload.updatedByUserId),
    createdAt: toStringValue(payload.createdAt),
    updatedAt: toStringValue(payload.updatedAt),
  }
}

const mapGlobalConfig = (item: unknown): GlobalConfig => {
  const payload = asObject(item)

  return {
    id: toNumber(payload.id),
    configKey: toStringValue(payload.configKey),
    configValue: toStringValue(payload.configValue),
    description: toStringValue(payload.description, '') || null,
    updatedByUserId: toNumber(payload.updatedByUserId),
    createdAt: toStringValue(payload.createdAt),
    updatedAt: toStringValue(payload.updatedAt),
  }
}

const mapNotification = (item: unknown): NotificationItem => {
  const payload = asObject(item)

  return {
    notificationId: toNumber(payload.notificationId),
    utilisateurId: toNumber(payload.utilisateurId),
    lu: toBoolean(payload.lu),
    luAt: toStringValue(payload.luAt, '') || null,
    type: toStringValue(payload.type),
    titre: toStringValue(payload.titre),
    contenu: toStringValue(payload.contenu),
    payloadJson: toStringValue(payload.payloadJson, '') || null,
    sourceEventId: toStringValue(payload.sourceEventId, '') || null,
    createdAt: toStringValue(payload.createdAt),
  }
}

const mapModerationItem = (item: unknown, type: ModerationItem['type']): ModerationItem => {
  const payload = asObject(item)
  const id = toNumber(payload.id)

  return {
    id,
    type,
    status: toStringValue(payload.status, 'PENDING'),
    title:
      toStringValue(payload.title, '') ||
      toStringValue(payload.titre, '') ||
      `${type} #${id}`,
    reason: toStringValue(payload.reason, '') || toStringValue(payload.motif, 'No reason supplied'),
    createdAt:
      toStringValue(payload.createdAt, '') ||
      toStringValue(payload.reportedAt, '') ||
      new Date().toISOString(),
    reportedByUserId:
      toNumber(payload.reportedByUserId, 0) > 0 ? toNumber(payload.reportedByUserId, 0) : null,
  }
}

const mapMetricPoint = (item: unknown): MetricPoint => {
  const payload = asObject(item)
  return {
    label: toStringValue(payload.label),
    value: toNumber(payload.value),
  }
}

export const getPlatformOverview = async (): Promise<PlatformOverview> => {
  const response = await httpClient.get<unknown>('/v1/analytics/platform-overview')
  const payload = asObject(response.data)
  return {
    totalUsers: toNumber(payload.totalUsers),
    totalEntities: toNumber(payload.totalEntities),
    totalCommunities: toNumber(payload.totalCommunities),
    totalPublications: toNumber(payload.totalPublications),
    totalEvents: toNumber(payload.totalEvents),
    totalRequests: toNumber(payload.totalRequests),
    totalNotifications: toNumber(payload.totalNotifications),
    computedAt: toStringValue(payload.computedAt),
  }
}

export const getEntityDistribution = async (): Promise<EntityDistribution> => {
  const response = await httpClient.get<unknown>('/v1/analytics/entity-distribution')
  const payload = asObject(response.data)
  return {
    entities: asArray<unknown>(payload.entities).map((item) => {
      const entity = asObject(item)
      return {
        entiteId: toNumber(entity.entiteId),
        nom: toStringValue(entity.nom, `Entity #${toNumber(entity.entiteId)}`),
        members: toNumber(entity.members),
        bureauMembers: toNumber(entity.bureauMembers),
        coordinators: toNumber(entity.coordinators),
      }
    }),
    totalMembers: toNumber(payload.totalMembers),
    totalBureauMembers: toNumber(payload.totalBureauMembers),
    totalCoordinators: toNumber(payload.totalCoordinators),
    computedAt: toStringValue(payload.computedAt),
  }
}

export const getPublicationMetrics = async (): Promise<PublicationMetrics> => {
  const response = await httpClient.get<unknown>('/v1/analytics/publication-metrics')
  const payload = asObject(response.data)
  return {
    totalPosts: toNumber(payload.totalPosts),
    postsByEntityTotal: toNumber(payload.postsByEntityTotal),
    likes: toNumber(payload.likes),
    comments: toNumber(payload.comments),
    engagement: toNumber(payload.engagement),
    postsByEntity: asArray<unknown>(payload.postsByEntity).map(mapMetricPoint),
    activity: asArray<unknown>(payload.activity).map(mapMetricPoint),
    computedAt: toStringValue(payload.computedAt),
  }
}

export const getEventMetrics = async (): Promise<EventMetrics> => {
  const response = await httpClient.get<unknown>('/v1/analytics/event-metrics')
  const payload = asObject(response.data)
  return {
    eventsCreated: toNumber(payload.eventsCreated),
    participationCount: toNumber(payload.participationCount),
    interestCount: toNumber(payload.interestCount),
    activity: asArray<unknown>(payload.activity).map(mapMetricPoint),
    computedAt: toStringValue(payload.computedAt),
  }
}

export const getCommunityMetrics = async (): Promise<CommunityMetrics> => {
  const response = await httpClient.get<unknown>('/v1/analytics/community-metrics')
  const payload = asObject(response.data)
  return {
    communitiesCreated: toNumber(payload.communitiesCreated),
    activeCommunities: toNumber(payload.activeCommunities),
    memberCount: toNumber(payload.memberCount),
    computedAt: toStringValue(payload.computedAt),
  }
}

export const getRequestMetrics = async (): Promise<RequestMetrics> => {
  const response = await httpClient.get<unknown>('/v1/analytics/request-metrics')
  const payload = asObject(response.data)
  return {
    requestsSubmitted: toNumber(payload.requestsSubmitted),
    approved: toNumber(payload.approved),
    rejected: toNumber(payload.rejected),
    pending: toNumber(payload.pending),
    processing: asArray<unknown>(payload.processing).map(mapMetricPoint),
    computedAt: toStringValue(payload.computedAt),
  }
}

export const getGlobalStats = async (): Promise<AdminGlobalStats> => {
  const response = await httpClient.get<AdminGlobalStats>('/v1/admin/stats/global')
  return response.data
}

export const getAnalyticsSnapshots = async (
  entiteId: number,
  limit = 30,
): Promise<AnalyticsSnapshot[]> => {
  const response = await httpClient.get<unknown>(`/v1/analytics/entities/${entiteId}/snapshots`, {
    params: { limit },
  })

  return asArray(response.data).map(mapAnalyticsSnapshot)
}

export const listRoles = async (): Promise<RoleOption[]> => {
  const response = await httpClient.get<unknown>('/v1/admin/roles')
  return asArray(response.data).map(mapRole)
}

export const createRole = async (roleName: 'USER' | 'ADMIN'): Promise<RoleOption> => {
  const response = await httpClient.post<unknown>('/v1/admin/roles', { roleName })
  return mapRole(response.data)
}

export const assignUserRole = async (userId: number, roleName: 'USER' | 'ADMIN'): Promise<AdminUser> => {
  const response = await httpClient.post<unknown>(`/v1/admin/users/${userId}/roles`, { roleName })
  return mapAdminUser(response.data)
}

export const listUsers = async (query: {
  page: number
  pageSize: number
  search: string
  role: string
  status: string
}): Promise<PagedResult<AdminUser>> => {
  const response = await httpClient.get<unknown>(env.adminUsersPath, {
    params: {
      page: query.page,
      size: query.pageSize,
      search: query.search || undefined,
      role: query.role || undefined,
      status: query.status || undefined,
    },
  })

  return normalizePagedResult<unknown, AdminUser>(response.data, query.page, query.pageSize, mapAdminUser)
}

export const updateUserStatus = async (
  userId: number,
  enabled: boolean,
  updatedByUserId: number,
): Promise<AdminUser> => {
  const path = resolvePathTemplate(env.adminUserStatusPath, { userId })

  try {
    const patchResponse = await httpClient.patch<unknown>(path, {
      enabled,
      updatedByUserId,
    })

    return mapAdminUser(patchResponse.data)
  } catch {
    const postResponse = await httpClient.post<unknown>(path, {
      enabled,
      updatedByUserId,
    })

    return mapAdminUser(postResponse.data)
  }
}

export const listPlatformSettings = async (): Promise<PlatformSetting[]> => {
  const response = await httpClient.get<unknown>('/v1/admin/settings')
  return asArray(response.data).map(mapSetting)
}

export const createPlatformSetting = async (input: {
  settingKey: string
  settingValue: string
  enabled: boolean
  description: string
  updatedByUserId: number
}): Promise<PlatformSetting> => {
  const response = await httpClient.post<unknown>('/v1/admin/settings', input)
  return mapSetting(response.data)
}

export const updatePlatformSetting = async (
  settingId: number,
  input: {
    settingValue: string
    enabled: boolean
    description: string
    updatedByUserId: number
  },
): Promise<PlatformSetting> => {
  const response = await httpClient.put<unknown>(`/v1/admin/settings/${settingId}`, input)
  return mapSetting(response.data)
}

export const deletePlatformSetting = async (settingId: number): Promise<void> => {
  await httpClient.delete(`/v1/admin/settings/${settingId}`)
}

export const listGlobalConfigs = async (): Promise<GlobalConfig[]> => {
  const response = await httpClient.get<unknown>('/v1/admin/configs')
  return asArray(response.data).map(mapGlobalConfig)
}

export const createGlobalConfig = async (input: {
  configKey: string
  configValue: string
  description: string
  updatedByUserId: number
}): Promise<GlobalConfig> => {
  const response = await httpClient.post<unknown>('/v1/admin/configs', input)
  return mapGlobalConfig(response.data)
}

export const updateGlobalConfig = async (
  configId: number,
  input: {
    configValue: string
    description: string
    updatedByUserId: number
  },
): Promise<GlobalConfig> => {
  const response = await httpClient.put<unknown>(`/v1/admin/configs/${configId}`, input)
  return mapGlobalConfig(response.data)
}

export const deleteGlobalConfig = async (configId: number): Promise<void> => {
  await httpClient.delete(`/v1/admin/configs/${configId}`)
}

export const listNotifications = async (userId: number): Promise<NotificationItem[]> => {
  const response = await httpClient.get<unknown>('/v1/notifications', {
    params: {
      utilisateurId: userId,
    },
  })

  return asArray(response.data).map(mapNotification)
}

export const markNotificationRead = async (
  notificationId: number,
  userId: number,
): Promise<NotificationItem> => {
  const response = await httpClient.post<unknown>(`/v1/notifications/${notificationId}/read`, null, {
    params: {
      utilisateurId: userId,
    },
  })

  return mapNotification(response.data)
}

export const listAuditLogs = async (limit: number): Promise<AuditLogEntry[]> => {
  const response = await httpClient.get<unknown>(env.adminAuditPath, {
    params: { limit },
  })

  return asArray(response.data).map((item) => {
    const payload = asObject(item)
    return {
      id: toStringValue(
        payload.id,
        `${toStringValue(payload.createdAt, 'unknown-time')}-${toStringValue(payload.action, 'UNKNOWN_ACTION')}-${toStringValue(payload.resourceType, 'system')}-${toStringValue(payload.resourceId, '-')}`,
      ),
      action: toStringValue(payload.action, 'UNKNOWN_ACTION'),
      resourceType: toStringValue(payload.resourceType, 'system'),
      resourceId: toStringValue(payload.resourceId, '-'),
      status: toStringValue(payload.status, 'SUCCESS') === 'FAILED' ? 'FAILED' : 'SUCCESS',
      details: toStringValue(payload.details, ''),
      createdAt: toStringValue(payload.createdAt, new Date().toISOString()),
    }
  })
}

export const listModerationPublications = async (query: {
  page: number
  pageSize: number
  search: string
}): Promise<PagedResult<ModerationItem>> => {
  const response = await httpClient.get<unknown>(env.moderationPublicationsPath, {
    params: {
      page: query.page,
      size: query.pageSize,
      search: query.search || undefined,
    },
  })

  return normalizePagedResult<unknown, ModerationItem>(response.data, query.page, query.pageSize, (item) =>
    mapModerationItem(item, 'PUBLICATION'),
  )
}

export const listModerationEvents = async (query: {
  page: number
  pageSize: number
  search: string
}): Promise<PagedResult<ModerationItem>> => {
  const response = await httpClient.get<unknown>(env.moderationEventsPath, {
    params: {
      page: query.page,
      size: query.pageSize,
      search: query.search || undefined,
    },
  })

  return normalizePagedResult<unknown, ModerationItem>(response.data, query.page, query.pageSize, (item) =>
    mapModerationItem(item, 'EVENT'),
  )
}

export const approveModerationPublication = async (
  id: number,
  adminUserId: number,
  reason: string,
): Promise<void> => {
  const path = resolvePathTemplate(env.moderationPublicationApprovePath, { id })
  await httpClient.post(path, { adminUserId, reason })
}

export const rejectModerationPublication = async (
  id: number,
  adminUserId: number,
  reason: string,
): Promise<void> => {
  const path = resolvePathTemplate(env.moderationPublicationRejectPath, { id })
  await httpClient.post(path, { adminUserId, reason })
}

export const approveModerationEvent = async (
  id: number,
  adminUserId: number,
  reason: string,
): Promise<void> => {
  const path = resolvePathTemplate(env.moderationEventApprovePath, { id })
  await httpClient.post(path, { adminUserId, reason })
}

export const rejectModerationEvent = async (
  id: number,
  adminUserId: number,
  reason: string,
): Promise<void> => {
  const path = resolvePathTemplate(env.moderationEventRejectPath, { id })
  await httpClient.post(path, { adminUserId, reason })
}
