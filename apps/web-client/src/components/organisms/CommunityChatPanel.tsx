import { useEffect, useRef, useState, type FormEvent } from 'react'
import { SendHorizontal, Wifi, WifiOff } from 'lucide-react'
import { Avatar } from '../atoms/Avatar'
import { useCommunityChat } from '../../hooks/useCommunityChat'
import { formatRelativeTime } from '../../lib/date'

interface CommunityChatPanelProps {
  communityId: number
}

export const CommunityChatPanel = ({ communityId }: CommunityChatPanelProps) => {
  const { messages, sendMessage, connectionStatus } = useCommunityChat(communityId)
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) {
      return
    }

    container.scrollTop = container.scrollHeight
  }, [messages])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    sendMessage(draft)
    setDraft('')
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Community Messages</h3>
          <p className="text-xs text-slate-500">Realtime conversation for this community</p>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
            connectionStatus === 'online'
              ? 'bg-emerald-100 text-emerald-700'
              : connectionStatus === 'connecting'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-slate-100 text-slate-600'
          }`}
        >
          {connectionStatus === 'online' ? <Wifi size={12} /> : <WifiOff size={12} />}
          {connectionStatus}
        </span>
      </header>

      <div ref={scrollRef} className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[88%] rounded-xl px-3 py-2 ${
              message.mine
                ? 'ml-auto bg-brand text-white'
                : 'border border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Avatar name={message.sender.fullName} size="sm" />
              <p className="text-xs font-semibold">{message.sender.fullName}</p>
            </div>
            <p className="mt-2 text-sm">{message.content}</p>
            <p className="mt-1 text-[11px] opacity-70">{formatRelativeTime(message.createdAt)}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a message"
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-brand"
        />
        <button
          type="submit"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white transition hover:bg-brand-700"
          aria-label="Send"
        >
          <SendHorizontal size={14} />
        </button>
      </form>
    </section>
  )
}
