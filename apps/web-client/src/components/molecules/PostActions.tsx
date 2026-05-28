import { Bookmark, Heart, MessageCircle, Share2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { PermissionAwareButton } from '../auth/PermissionAwareButton'
import { cn } from '../../lib/cn'

interface PostActionsProps {
  liked: boolean
  saved: boolean
  likeCount: number
  commentCount: number
  shareCount: number
  entityId: number
  onToggleLike: () => void
  onToggleComments: () => void
  onShare: () => void
  onToggleSaved: () => void
}

const ActionButton = ({
  active,
  label,
  onClick,
  icon,
  entityId,
  permission,
}: {
  active?: boolean
  label: string
  onClick: () => void
  icon: ReactNode
  entityId?: number
  permission?: string
}) => (
  <PermissionAwareButton
    permission={permission}
    entityId={entityId}
    onClick={onClick}
    className={cn(
      'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
      active ? 'bg-brand/10 text-brand' : 'text-slate-600 hover:bg-slate-100',
    )}
  >
    {icon}
    <span>{label}</span>
  </PermissionAwareButton>
)

export const PostActions = ({
  liked,
  saved,
  likeCount,
  commentCount,
  shareCount,
  entityId,
  onToggleLike,
  onToggleComments,
  onShare,
  onToggleSaved,
}: PostActionsProps) => (
  <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-slate-100 pt-3">
    <ActionButton
      active={liked}
      label={`Like (${likeCount})`}
    onClick={onToggleLike}
    entityId={entityId}
    permission="PUBLICATION_REACTION_ADD"
    icon={<Heart size={16} className={liked ? 'fill-current' : ''} />}
  />
    <ActionButton
    label={`Comment (${commentCount})`}
    onClick={onToggleComments}
    entityId={entityId}
    permission="PUBLICATION_COMMENT_ADD"
    icon={<MessageCircle size={16} />}
  />
    <ActionButton
      label={`Share (${shareCount})`}
      onClick={onShare}
      icon={<Share2 size={16} />}
    />
    <ActionButton
      active={saved}
      label="Save"
      onClick={onToggleSaved}
      icon={<Bookmark size={16} className={saved ? 'fill-current' : ''} />}
    />
  </div>
)
