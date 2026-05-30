import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import type { ChatMessage } from '../../../types/social'

interface MessageListProps {
  messages: ChatMessage[]
  isLoading?: boolean
}

const shouldShowSenderInfo = (messages: ChatMessage[], index: number): boolean => {
  if (index === 0) return true
  const current = messages[index]
  const previous = messages[index - 1]
  if (current.mine !== previous.mine) return true
  return current.sender.id !== previous.sender.id
}

export const MessageList = ({ messages, isLoading }: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          <p className="mt-3 text-sm text-slate-500">Loading messages…</p>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-2xl">💬</p>
          <p className="mt-2 text-sm font-semibold text-slate-700">No messages yet</p>
          <p className="mt-1 text-xs text-slate-400">Be the first to say hello!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5 py-4">
      <div className="space-y-0.5">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            showSenderInfo={shouldShowSenderInfo(messages, index)}
          />
        ))}
      </div>
      <div ref={bottomRef} />
    </div>
  )
}
