import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { CommunityListItem } from '../../molecules/CommunityListItem'
import { useChatStore } from '../../../stores/chatStore'
import type { ChatStoreState } from '../../../stores/chatStore'
import type { MyCommunity } from '../../../types/social'

interface CommunitySidebarProps {
  communities: MyCommunity[]
  isLoading: boolean
  activeCommunityId: number | null
  onSelectCommunity: (communityId: number) => void
}

const selectUnreadCounts = (state: ChatStoreState) => state.unreadCountByCommunity
const selectMessagesByCommunity = (state: ChatStoreState) => state.messagesByCommunity

export const CommunitySidebar = ({
  communities,
  isLoading,
  activeCommunityId,
  onSelectCommunity,
}: CommunitySidebarProps) => {
  const [search, setSearch] = useState('')

  const unreadCounts = useChatStore(selectUnreadCounts)
  const messagesByCommunity = useChatStore(selectMessagesByCommunity)

  const filtered = useMemo(
    () =>
      search.trim()
        ? communities.filter((c) =>
            c.name.toLowerCase().includes(search.toLowerCase()),
          )
        : communities,
    [communities, search],
  )

  const getLastMessage = (community: MyCommunity) => {
    const storeMessages = messagesByCommunity[community.id]
    if (storeMessages && storeMessages.length > 0) {
      const last = storeMessages[storeMessages.length - 1]
      return { content: last.content, at: last.createdAt }
    }
    return {
      content: community.lastMessageContent,
      at: community.lastMessageAt,
    }
  }

  return (
    <aside className="flex h-full flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-4">
        <h2 className="text-base font-semibold text-slate-800">Messages</h2>
        <p className="mt-0.5 text-xs text-slate-500">Your communities</p>
      </div>

      <div className="border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <Search size={14} className="shrink-0 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search communities"
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl p-2">
                <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-3/4 rounded bg-slate-200 animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-slate-100 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm font-semibold text-slate-700">
              {search ? 'No communities found' : 'No communities yet'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {search
                ? 'Try a different search term'
                : 'Join a community to start chatting'}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filtered.map((community) => {
              const { content, at } = getLastMessage(community)
              return (
                <CommunityListItem
                  key={community.id}
                  community={community}
                  isActive={activeCommunityId === community.id}
                  unreadCount={unreadCounts[community.id] ?? 0}
                  lastMessage={content}
                  lastMessageAt={at}
                  onClick={() => onSelectCommunity(community.id)}
                />
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}
