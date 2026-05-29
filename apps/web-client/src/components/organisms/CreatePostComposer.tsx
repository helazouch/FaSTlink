import { ImagePlus, X } from 'lucide-react'
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Avatar } from '../atoms/Avatar'
import { PermissionAwareButton } from '../auth/PermissionAwareButton'
import type { CreatePostInput, LocalMediaInput, PublicationScope, UserSummary } from '../../types/social'

interface CreatePostComposerProps {
  currentUser: UserSummary
  publishingEntities: Array<{ id: number; name: string }>
  allEntities: Array<{ id: number; name: string }>
  onSubmit: (input: CreatePostInput) => Promise<unknown>
  isSubmitting: boolean
  errorMessage?: string | null
  successMessage?: string | null
}

const createMediaId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const CreatePostComposer = ({
  currentUser,
  publishingEntities,
  allEntities,
  onSubmit,
  isSubmitting,
  errorMessage,
  successMessage,
}: CreatePostComposerProps) => {
  const [content, setContent] = useState('')
  const [media, setMedia] = useState<LocalMediaInput[]>([])
  const [publishingEntityId, setPublishingEntityId] = useState(publishingEntities[0]?.id ?? 0)
  const [scope, setScope] = useState<PublicationScope>('MY_ENTITY')
  const [selectedEntityIds, setSelectedEntityIds] = useState<number[]>([])
  const [localError, setLocalError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleMediaChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) {
      return
    }

    try {
      const nextMedia = await Promise.all(Array.from(files).map(readFileAsMedia))
      setMedia((current) => [...current, ...nextMedia])
      setLocalError(null)
    } catch {
      setLocalError('Media upload could not be prepared. Please choose a valid image file.')
    }

    event.target.value = ''
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
    const normalizedSelectedEntityIds = scope === 'SELECTED_ENTITIES' ? selectedEntityIds : []
    if (!sanitized && media.length === 0) {
      setLocalError('Write text or add media before publishing.')
      return
    }
    if (!publishingEntityId) {
      setLocalError('Choose the entity you want to publish as.')
      return
    }
    if (scope === 'SELECTED_ENTITIES' && normalizedSelectedEntityIds.length === 0) {
      setLocalError('Choose at least one target entity.')
      return
    }

    await onSubmit({
      content: sanitized,
      communityId: publishingEntityId,
      entity: publishingEntities.find((entity) => entity.id === publishingEntityId)?.name ?? `Entity ${publishingEntityId}`,
      author: currentUser,
      media,
      publishingEntityId,
      scope,
      selectedEntityIds: normalizedSelectedEntityIds,
    })

    setContent('')
    setMedia((current) => {
      for (const item of current) {
        URL.revokeObjectURL(item.previewUrl)
      }

      return []
    })
    setScope('MY_ENTITY')
    setSelectedEntityIds([])
    setLocalError(null)
  }

  const toggleTargetEntity = (entityId: number) => {
    setSelectedEntityIds((current) =>
      current.includes(entityId) ? current.filter((id) => id !== entityId) : [...current, entityId],
    )
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

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          Publish as
          <select
            value={publishingEntityId}
            onChange={(event) => setPublishingEntityId(Number(event.target.value))}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm normal-case tracking-normal text-slate-700 outline-none focus:border-brand"
          >
            {publishingEntities.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          Scope
          <select
            value={scope}
            onChange={(event) => setScope(event.target.value as PublicationScope)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm normal-case tracking-normal text-slate-700 outline-none focus:border-brand"
          >
            <option value="MY_ENTITY">My entity</option>
            <option value="ALL_ENTITIES">All entities</option>
            <option value="ALL_USERS">All users</option>
            <option value="SELECTED_ENTITIES">Selected entities</option>
          </select>
        </label>
      </div>

      {scope === 'SELECTED_ENTITIES' ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Target entities</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {allEntities.map((entity) => (
              <label
                key={entity.id}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={selectedEntityIds.includes(entity.id)}
                  onChange={() => toggleTargetEntity(entity.id)}
                  className="h-4 w-4 accent-brand"
                />
                {entity.name}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {localError || errorMessage ? (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {localError ?? errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="mt-3 rounded-xl bg-brand/10 px-3 py-2 text-sm font-semibold text-brand">{successMessage}</p>
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

          <PermissionAwareButton
          type="submit"
          permission="PUBLICATION_CREATE"
          entityId={publishingEntityId}
          disabled={
            isSubmitting ||
            (!content.trim() && media.length === 0) ||
            !publishingEntityId ||
            (scope === 'SELECTED_ENTITIES' && selectedEntityIds.length === 0)
          }
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Publishing...' : 'Post'}
        </PermissionAwareButton>
      </div>
    </form>
  )
}

const readFileAsMedia = (file: File): Promise<LocalMediaInput> =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Unsupported media type'))
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Unable to read media'))
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : ''
      if (!dataUrl) {
        reject(new Error('Unable to read media'))
        return
      }
      resolve({
        id: createMediaId(),
        name: file.name,
        mimeType: file.type,
        previewUrl: dataUrl,
        dataUrl,
      })
    }
    reader.readAsDataURL(file)
  })
