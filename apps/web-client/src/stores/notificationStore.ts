import { create } from 'zustand'
import type { NotificationItem } from '../types/social'

export interface NotificationStoreState {
  items: NotificationItem[]
  setItems: (items: NotificationItem[]) => void
  prependNotification: (item: NotificationItem) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

const mergeById = (items: NotificationItem[]): NotificationItem[] => {
  const seen = new Set<string>()
  const deduplicated: NotificationItem[] = []

  for (const item of items) {
    if (seen.has(item.id)) {
      continue
    }

    seen.add(item.id)
    deduplicated.push(item)
  }

  return deduplicated
}

export const useNotificationStore = create<NotificationStoreState>((set) => ({
  items: [],
  setItems: (items) => set({ items: mergeById(items) }),
  prependNotification: (item) =>
    set((state) => ({
      items: mergeById([item, ...state.items]),
    })),
  markAsRead: (id) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, read: true } : item)),
    })),
  markAllAsRead: () =>
    set((state) => ({
      items: state.items.map((item) => ({ ...item, read: true })),
    })),
}))
