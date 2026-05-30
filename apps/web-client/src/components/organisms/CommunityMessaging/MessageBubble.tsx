import { cn } from '../../../lib/cn'
import { formatRelativeTime } from '../../../lib/date'
import { Avatar } from '../../atoms/Avatar'
import type { ChatMessage } from '../../../types/social'

interface MessageBubbleProps {
  message: ChatMessage
  showSenderInfo: boolean
}

export const MessageBubble = ({ message, showSenderInfo }: MessageBubbleProps) => {
  if (message.mine) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%]">
          <div className="rounded-2xl rounded-tr-sm bg-brand px-4 py-2.5 text-white shadow-sm">
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {message.content}
            </p>
          </div>
          <p className="mt-1 text-right text-[11px] text-slate-400">
            {formatRelativeTime(message.createdAt)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex items-end gap-2', showSenderInfo ? 'mt-3' : 'mt-0.5')}>
      <div className={cn('shrink-0', showSenderInfo ? 'visible' : 'invisible')}>
        <Avatar name={message.sender.fullName} size="sm" />
      </div>

      <div className="max-w-[75%]">
        {showSenderInfo ? (
          <p className="mb-1 ml-1 text-xs font-semibold text-slate-600">
            {message.sender.fullName}
          </p>
        ) : null}
        <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-800">
            {message.content}
          </p>
        </div>
        <p className="mt-1 ml-1 text-[11px] text-slate-400">
          {formatRelativeTime(message.createdAt)}
        </p>
      </div>
    </div>
  )
}
