/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_DEFAULT_ENTITY_ID?: string
  readonly VITE_DEFAULT_PAGE_SIZE?: string
  readonly VITE_ADMIN_USERS_PATH?: string
  readonly VITE_ADMIN_USER_STATUS_PATH?: string
  readonly VITE_ADMIN_AUDIT_PATH?: string
  readonly VITE_MODERATION_PUBLICATIONS_PATH?: string
  readonly VITE_MODERATION_EVENTS_PATH?: string
  readonly VITE_MODERATION_PUBLICATION_APPROVE_PATH?: string
  readonly VITE_MODERATION_PUBLICATION_REJECT_PATH?: string
  readonly VITE_MODERATION_EVENT_APPROVE_PATH?: string
  readonly VITE_MODERATION_EVENT_REJECT_PATH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
