/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_WS_URL?: string
  readonly VITE_CHAT_TOPIC?: string
  readonly VITE_CHAT_DESTINATION?: string
  readonly VITE_ENABLE_CHAT_WS?: string
  readonly VITE_DEFAULT_ENTITY_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
