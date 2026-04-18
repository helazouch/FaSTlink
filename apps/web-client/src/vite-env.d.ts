/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string

  // New websocket configuration
  readonly VITE_WS_COMMUNITY_URL?: string
  readonly VITE_WS_NOTIFICATION_URL?: string
  readonly VITE_CHAT_TOPIC_PREFIX?: string
  readonly VITE_NOTIFICATION_TOPIC_PREFIX?: string
  readonly VITE_ENABLE_WEBSOCKET?: string
  readonly VITE_FEED_PAGE_SIZE?: string
  readonly VITE_DEFAULT_COMMUNITY_ID?: string

  // Legacy keys retained for compatibility
  readonly VITE_WS_URL?: string
  readonly VITE_CHAT_TOPIC?: string
  readonly VITE_CHAT_DESTINATION?: string
  readonly VITE_ENABLE_CHAT_WS?: string
  readonly VITE_DEFAULT_ENTITY_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
