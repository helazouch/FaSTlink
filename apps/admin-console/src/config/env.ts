const asNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  defaultEntityId: asNumber(import.meta.env.VITE_DEFAULT_ENTITY_ID, 1),
  defaultPageSize: asNumber(import.meta.env.VITE_DEFAULT_PAGE_SIZE, 10),
  adminUsersPath: import.meta.env.VITE_ADMIN_USERS_PATH ?? '/v1/admin/users',
  adminUserStatusPath:
    import.meta.env.VITE_ADMIN_USER_STATUS_PATH ?? '/v1/admin/users/{userId}/status',
  adminAuditPath: import.meta.env.VITE_ADMIN_AUDIT_PATH ?? '/v1/admin/audit/logs',
  moderationPublicationsPath:
    import.meta.env.VITE_MODERATION_PUBLICATIONS_PATH ?? '/v1/admin/moderation/publications',
  moderationEventsPath:
    import.meta.env.VITE_MODERATION_EVENTS_PATH ?? '/v1/admin/moderation/events',
  moderationPublicationApprovePath:
    import.meta.env.VITE_MODERATION_PUBLICATION_APPROVE_PATH ??
    '/v1/admin/moderation/publications/{id}/approve',
  moderationPublicationRejectPath:
    import.meta.env.VITE_MODERATION_PUBLICATION_REJECT_PATH ??
    '/v1/admin/moderation/publications/{id}/reject',
  moderationEventApprovePath:
    import.meta.env.VITE_MODERATION_EVENT_APPROVE_PATH ??
    '/v1/admin/moderation/events/{id}/approve',
  moderationEventRejectPath:
    import.meta.env.VITE_MODERATION_EVENT_REJECT_PATH ??
    '/v1/admin/moderation/events/{id}/reject',
}

export const resolvePathTemplate = (
  template: string,
  params: Record<string, string | number>,
): string => {
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`{${key}}`, String(value)),
    template,
  )
}
