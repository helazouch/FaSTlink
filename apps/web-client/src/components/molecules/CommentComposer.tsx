import { useState, type FormEvent } from 'react'
import { SendHorizontal } from 'lucide-react'

interface CommentComposerProps {
  onSubmit: (content: string) => Promise<unknown>
  disabled?: boolean
}

export const CommentComposer = ({ onSubmit, disabled = false }: CommentComposerProps) => {
  const [content, setContent] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const sanitized = content.trim()
    if (!sanitized) {
      return
    }

    await onSubmit(sanitized)
    setContent('')
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
      <input
        value={content}
        onChange={(event) => setContent(event.target.value)}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-brand"
        placeholder="Write a comment"
      />
      <button
        type="submit"
        disabled={disabled}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Send comment"
      >
        <SendHorizontal size={15} />
      </button>
    </form>
  )
}
