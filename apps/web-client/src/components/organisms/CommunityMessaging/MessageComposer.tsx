import { type FormEvent, type KeyboardEvent, useRef, useState } from 'react'
import { SendHorizontal } from 'lucide-react'

interface MessageComposerProps {
  onSend: (content: string) => void
  disabled?: boolean
  errorMessage?: string | null
}

export const MessageComposer = ({ onSend, disabled, errorMessage }: MessageComposerProps) => {
  const [draft, setDraft] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const submit = () => {
    const trimmed = draft.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setDraft('')
    textareaRef.current?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    submit()
  }

  const isEmpty = draft.trim().length === 0

  return (
    <div className="border-t border-slate-200 bg-white px-4 py-3">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
          rows={1}
          disabled={disabled}
          className="max-h-36 min-h-[42px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-brand focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 placeholder:text-slate-400"
          style={{ overflowY: draft.split('\n').length > 2 ? 'auto' : 'hidden' }}
        />
        <button
          type="submit"
          disabled={isEmpty || disabled}
          className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send message"
        >
          <SendHorizontal size={16} />
        </button>
      </form>
      <p className="mt-1.5 text-[11px] text-slate-400">
        Press <kbd className="rounded bg-slate-100 px-1 py-0.5 text-[10px] font-medium text-slate-500">Enter</kbd> to send
        {' · '}
        <kbd className="rounded bg-slate-100 px-1 py-0.5 text-[10px] font-medium text-slate-500">Shift+Enter</kbd> for newline
      </p>
      {errorMessage ? (
        <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
