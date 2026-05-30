import { Users, Wifi, WifiOff } from 'lucide-react'
import { Avatar } from '../../atoms/Avatar'
import type { MyCommunity } from '../../../types/social'

type ConnectionStatus = 'connecting' | 'online' | 'offline'

interface ConversationHeaderProps {
  community: MyCommunity
  connectionStatus: ConnectionStatus
  memberCount?: number
}

const statusLabel: Record<ConnectionStatus, string> = {
  online: 'Live',
  connecting: 'Connecting',
  offline: 'Offline',
}

const statusClasses: Record<ConnectionStatus, string> = {
  online: 'bg-emerald-100 text-emerald-700',
  connecting: 'bg-amber-100 text-amber-700',
  offline: 'bg-slate-100 text-slate-500',
}

export const ConversationHeader = ({
  community,
  connectionStatus,
  memberCount,
}: ConversationHeaderProps) => (
  <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3.5">
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={community.name} size="md" />
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-slate-800">
          {community.name}
        </h3>
        {community.description ? (
          <p className="truncate text-xs text-slate-500">{community.description}</p>
        ) : null}
      </div>
    </div>

    <div className="flex shrink-0 items-center gap-3">
      {memberCount != null ? (
        <span className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex">
          <Users size={13} />
          {memberCount} members
        </span>
      ) : null}

      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[connectionStatus]}`}
      >
        {connectionStatus === 'online' ? (
          <Wifi size={11} />
        ) : (
          <WifiOff size={11} />
        )}
        {statusLabel[connectionStatus]}
      </span>
    </div>
  </div>
)
