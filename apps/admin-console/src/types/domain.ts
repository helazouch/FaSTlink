export interface PagedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface AdminGlobalStats {
  totalGlobalConfigs: number
  totalPlatformSettings: number
  enabledPlatformSettings: number
  disabledPlatformSettings: number
  lastGlobalConfigUpdatedAt: string | null
  lastPlatformSettingUpdatedAt: string | null
  computedAt: string
}

export interface AnalyticsSnapshot {
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

export interface MetricPoint {
  label: string
  value: number
}

export interface PlatformOverview {
  totalUsers: number
  totalEntities: number
  totalCommunities: number
  totalPublications: number
  totalEvents: number
  totalRequests: number
  totalNotifications: number
  computedAt: string
}

export interface EntityDistributionItem {
  entiteId: number
  nom: string
  members: number
  bureauMembers: number
  coordinators: number
}

export interface EntityDistribution {
  entities: EntityDistributionItem[]
  totalMembers: number
  totalBureauMembers: number
  totalCoordinators: number
  computedAt: string
}

export interface PublicationMetrics {
  totalPosts: number
  postsByEntityTotal: number
  likes: number
  comments: number
  engagement: number
  postsByEntity: MetricPoint[]
  activity: MetricPoint[]
  computedAt: string
}

export interface EventMetrics {
  eventsCreated: number
  participationCount: number
  interestCount: number
  activity: MetricPoint[]
  computedAt: string
}

export interface CommunityMetrics {
  communitiesCreated: number
  activeCommunities: number
  memberCount: number
  computedAt: string
}

export interface RequestMetrics {
  requestsSubmitted: number
  approved: number
  rejected: number
  pending: number
  processing: MetricPoint[]
  computedAt: string
}

export interface PlatformSetting {
  id: number
  settingKey: string
  settingValue: string
  enabled: boolean
  description: string | null
  updatedByUserId: number
  createdAt: string
  updatedAt: string
}

export interface GlobalConfig {
  id: number
  configKey: string
  configValue: string
  description: string | null
  updatedByUserId: number
  createdAt: string
  updatedAt: string
}

export interface NotificationItem {
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

export interface RoleOption {
  id: number
  name: string
}

export interface AdminUser {
  id: number
  fullName: string
  email: string
  roles: string[]
  enabled: boolean
  createdAt: string | null
  updatedAt: string | null
}

export interface EntityMember {
  id: number
  entiteId: number
  utilisateurId: number
  userName: string | null
  userEmail: string | null
  role: string
  status: string | null
  assignedBy: number | null
  createdAt: string
  updatedAt: string
}

export interface EntityRecord {
  id: number
  nom: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface CommunityMember {
  id: number
  communauteId: number
  utilisateurId: number
  role: string
  createdAt: string
  updatedAt: string
}

export interface CommunityMessage {
  id: number
  communauteId: number
  utilisateurId: number
  contenu: string
  createdAt: string
}

export interface Room {
  id: number
  entiteId: number
  nom: string
  capacite: number
  localisation: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface RequestRecord {
  id: number
  entiteId: number
  demandeurUtilisateurId: number
  objet: string
  description: string | null
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  decisionCommentaire: string | null
  decideurUtilisateurId: number | null
  submittedAt: string | null
  decisionAt: string | null
  createdAt: string
  updatedAt: string
}

export interface PublicationRecord {
  id: number
  utilisateurId: number
  authorName: string | null
  authorEmail: string | null
  contenu: string
  publishingEntityId: number | null
  scope: 'MY_ENTITY' | 'ALL_ENTITIES' | 'ALL_USERS' | 'SELECTED_ENTITIES'
  entiteIds: number[]
  entityNames: string[]
  createdAt: string
  updatedAt: string
}

export interface EventRecord {
  id: number
  entiteId: number
  entityName: string | null
  createurUtilisateurId: number
  organizerName: string | null
  organizerEmail: string | null
  titre: string
  description: string | null
  lieu: string | null
  status: 'UPCOMING' | 'ONGOING' | 'CLOSED'
  debutAt: string
  finAt: string
  createdAt: string
  updatedAt: string
}

export interface ModerationItem {
  id: number
  type: 'PUBLICATION' | 'EVENT'
  status: string
  title: string
  reason: string
  createdAt: string
  reportedByUserId: number | null
}

export interface AuditLogEntry {
  id: string
  action: string
  resourceType: string
  resourceId: string
  status: 'SUCCESS' | 'FAILED'
  details: string
  createdAt: string
}

export interface ApiProblem {
  timestamp?: string
  status?: number
  error?: string
  message?: string
  path?: string
  validationErrors?: Record<string, string>
}
