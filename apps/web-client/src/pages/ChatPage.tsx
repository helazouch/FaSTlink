import { format } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { SendHorizontal, Wifi, WifiOff } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { useChat } from '../hooks/useChat'

const quickReplies = [
  'Can we publish the event recap now?',
  'Please share the top 3 communities by engagement.',
  'I am opening a support thread for onboarding feedback.',
]

export const ChatPage = () => {
  const { messages, connectionState, sendMessage } = useChat()
  const [draft, setDraft] = useState('')
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) {
      return
    }

    container.scrollTop = container.scrollHeight
  }, [messages])

  const connectionToneClassName =
    connectionState === 'online'
      ? 'bg-emerald-500/20 text-emerald-300'
      : connectionState === 'connecting'
        ? 'bg-amber-500/20 text-amber-300'
        : 'bg-rose-500/20 text-rose-300'

  const connectionLabel =
    connectionState === 'online'
      ? 'Connected'
      : connectionState === 'connecting'
        ? 'Connecting'
        : 'Offline mode'

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    sendMessage(draft)
    setDraft('')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Live Chat"
        title="Realtime Team Room"
        subtitle="Coordinate releases, event operations and moderation tasks through persistent websocket channels."
        action={
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${connectionToneClassName}`}>
            {connectionState === 'online' ? <Wifi size={14} /> : <WifiOff size={14} />}
            {connectionLabel}
          </div>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
        <article className="glass-panel flex h-[66vh] flex-col p-5">
          <div className="mb-4 border-b border-white/10 pb-4">
            <p className="text-sm font-semibold text-white"># general</p>
            <p className="text-xs text-slate-400">Cross-team operations and announcements</p>
          </div>

          <div ref={scrollContainerRef} className="flex-1 space-y-3 overflow-y-auto pr-1">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                  message.mine
                    ? 'ml-auto bg-brand-600 text-white'
                    : 'border border-white/10 bg-white/5 text-slate-100'
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/80">
                  {message.sender}
                </p>
                <p className="mt-1 text-sm leading-relaxed">{message.content}</p>
                <p className="mt-2 text-[11px] text-white/65">
                  {format(new Date(message.sentAt), 'HH:mm')}
                </p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Write a message..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-brand-400"
            />
            <button
              type="submit"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-500"
              aria-label="Send message"
            >
              <SendHorizontal size={16} />
            </button>
          </form>
        </article>

        <aside className="space-y-4">
          <article className="glass-panel p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Quick Prompts</p>
            <div className="mt-4 space-y-2">
              {quickReplies.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-white/10"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </article>

          <article className="glass-panel p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Channel Health</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">WebSocket transport: SockJS + STOMP</li>
              <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Reconnect interval: 5 seconds</li>
              <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Fallback: local queue in offline mode</li>
            </ul>
          </article>
        </aside>
      </section>
    </div>
  )
}
