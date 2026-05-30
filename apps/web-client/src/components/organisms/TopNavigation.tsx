import { Bell, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { IconButton } from '../atoms/IconButton'
import { SearchField } from '../molecules/SearchField'
import { UserDropdown } from '../molecules/UserDropdown'
import { useFeedStore } from '../../stores/feedStore'
import type { FeedStoreState } from '../../stores/feedStore'
import { useNotificationStore } from '../../stores/notificationStore'
import type { NotificationStoreState } from '../../stores/notificationStore'
import { useChatStore } from '../../stores/chatStore'
import type { ChatStoreState } from '../../stores/chatStore'
import type { NotificationItem } from '../../types/social'

const selectSearchQuery = (state: FeedStoreState) => state.searchQuery
const selectSetSearchQuery = (state: FeedStoreState) => state.setSearchQuery
const selectNotificationItems = (state: NotificationStoreState) => state.items
const selectUnreadCounts = (state: ChatStoreState) => state.unreadCountByCommunity

export const TopNavigation = () => {
  const searchQuery = useFeedStore(selectSearchQuery)
  const setSearchQuery = useFeedStore(selectSetSearchQuery)
  const notificationItems = useNotificationStore(selectNotificationItems)
  const unreadCountByCommunity = useChatStore(selectUnreadCounts)

  const unreadNotifications = notificationItems.filter(
    (item: NotificationItem) => !item.read,
  ).length

  const totalUnreadMessages = (Object.values(unreadCountByCommunity) as number[]).reduce(
    (sum: number, count: number) => sum + count,
    0,
  )

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center justify-between gap-3 px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <Link to="/" className="text-xl font-black tracking-tight text-brand">
            FaST Link
          </Link>
          <div className="hidden w-[360px] md:block">
            <SearchField
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search people, posts, communities"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/notifications" className="relative">
            <IconButton icon={<Bell size={18} />} label="Notifications" />
            {unreadNotifications > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                {Math.min(unreadNotifications, 99)}
              </span>
            ) : null}
          </Link>

          <Link to="/messages" className="relative">
            <IconButton icon={<MessageCircle size={18} />} label="Messages" />
            {totalUnreadMessages > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                {Math.min(totalUnreadMessages, 99)}
              </span>
            ) : null}
          </Link>

          <UserDropdown />
        </div>
      </div>
      <div className="border-t border-slate-100 px-4 pb-3 pt-2 md:hidden">
        <SearchField
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search people, posts, communities"
        />
      </div>
    </header>
  )
}
