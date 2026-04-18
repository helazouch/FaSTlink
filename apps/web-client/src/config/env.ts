const asBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (!value) {
    return defaultValue
  }

  const normalized = value.trim().toLowerCase()
  if (normalized === 'true') {
    return true
  }

  if (normalized === 'false') {
    return false
  }

  return defaultValue
}

const asNumber = (value: string | undefined, defaultValue: number): number => {
  if (!value) {
    return defaultValue
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : defaultValue
}

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  wsUrl: import.meta.env.VITE_WS_URL ?? '/ws-community',
  chatTopicPrefix: import.meta.env.VITE_CHAT_TOPIC_PREFIX ?? '/topic/chat.',
  chatDestination: import.meta.env.VITE_CHAT_DESTINATION ?? '/app/chat.send',
  notificationTopicPrefix:
    import.meta.env.VITE_NOTIFICATION_TOPIC_PREFIX ?? '/topic/notifications.',
  enableWebsocket: asBoolean(import.meta.env.VITE_ENABLE_WEBSOCKET, true),
  feedPageSize: asNumber(import.meta.env.VITE_FEED_PAGE_SIZE, 5),
  defaultCommunityId: asNumber(import.meta.env.VITE_DEFAULT_COMMUNITY_ID, 1),
}
