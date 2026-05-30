import { cn } from '../../lib/cn'
import { formatRelativeTime } from '../../lib/date'
import { Avatar } from '../atoms/Avatar'
import type { MyCommunity } from '../../types/social'

interface CommunityListItemProps {
  community: MyCommunity
  isActive: boolean
  unreadCount: number
  lastMessage?: string
  lastMessageAt?: string
  onClick: () => void
}

export const CommunityListItem = ({
  community,
  isActive,
  unreadCount,
  lastMessage,
  lastMessageAt,
  onClick,
}: CommunityListItemProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
      isActive
        ? 'bg-brand/10 ring-1 ring-brand/20'
        : 'hover:bg-slate-50',
    )}
  >
    <Avatar name={community.name} size="md" className="mt-0.5 shrink-0" />

    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between gap-1">
        <span
          className={cn(
            'truncate text-sm font-semibold',
            isActive ? 'text-brand' : 'text-slate-800',
          )}
        >
          {community.name}
        </span>

        {lastMessageAt ? (
          <span className="shrink-0 text-[11px] text-slate-400">
            {formatRelativeTime(lastMessageAt)}
          </span>
        ) : null}
      </div>

      <div className="mt-0.5 flex items-center justify-between gap-1">
        <p className="truncate text-xs text-slate-500">
          {lastMessage ?? 'No messages yet'}
        </p>

        {unreadCount > 0 ? (
          <span className="shrink-0 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
            {Math.min(unreadCount, 99)}
          </span>
        ) : null}
      </div>
    </div>
  </button>
)
