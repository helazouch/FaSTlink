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
  role: string
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
  contenu: string
  entiteIds: number[]
  createdAt: string
  updatedAt: string
}

export interface EventRecord {
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
