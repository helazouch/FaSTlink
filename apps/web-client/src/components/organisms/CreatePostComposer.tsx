import { ImagePlus, X } from 'lucide-react'
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Avatar } from '../atoms/Avatar'
import { Button } from '../atoms/Button'
import type { CreatePostInput, LocalMediaInput, UserSummary } from '../../types/social'

interface CreatePostComposerProps {
  currentUser: UserSummary
  defaultCommunityId: number
  onSubmit: (input: CreatePostInput) => Promise<unknown>
  isSubmitting: boolean
}

const createMediaId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const CreatePostComposer = ({
  currentUser,
  defaultCommunityId,
  onSubmit,
  isSubmitting,
}: CreatePostComposerProps) => {
  const [content, setContent] = useState('')
  const [media, setMedia] = useState<LocalMediaInput[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleMediaChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) {
      return
    }

    const nextMedia = Array.from(files).map((file) => ({
      id: createMediaId(),
      name: file.name,
      mimeType: file.type,
      previewUrl: URL.createObjectURL(file),
    }))

    setMedia((current) => [...current, ...nextMedia])
  }

  const removeMedia = (id: string) => {
    setMedia((current) => {
      const target = current.find((item) => item.id === id)
      if (target) {
        URL.revokeObjectURL(target.previewUrl)
      }

      return current.filter((item) => item.id !== id)
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const sanitized = content.trim()
    if (!sanitized) {
      return
    }

    await onSubmit({
      content: sanitized,
      communityId: defaultCommunityId,
      entity: 'FaST Link',
      author: currentUser,
      media,
    })

    setContent('')
    setMedia((current) => {
      for (const item of current) {
        URL.revokeObjectURL(item.previewUrl)
      }

      return []
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar name={currentUser.fullName} />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Share an update with your communities"
            className="min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand"
          />
        </div>
      </div>

      {media.length > 0 ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {media.map((item) => (
            <div key={item.id} className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              <img src={item.previewUrl} alt={item.name} className="h-36 w-full object-cover" />
              <button
                type="button"
                onClick={() => removeMedia(item.id)}
                className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
                aria-label={`Remove ${item.name}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleMediaChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
          >
            <ImagePlus size={15} />
            Add media
          </button>
        </div>

        <Button type="submit" disabled={isSubmitting || content.trim().length === 0}>
          {isSubmitting ? 'Publishing...' : 'Post'}
        </Button>
      </div>
    </form>
  )
}
