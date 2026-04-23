import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button } from '../atoms/Button'
import { TextInput } from '../atoms/TextInput'
import type { CommunitySummary, SubmitRequestInput } from '../../types/social'

interface RequestSubmissionPanelProps {
  communities: CommunitySummary[]
  onSubmit: (input: SubmitRequestInput) => Promise<unknown>
  isSubmitting: boolean
}

export const RequestSubmissionPanel = ({
  communities,
  onSubmit,
  isSubmitting,
}: RequestSubmissionPanelProps) => {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Operations')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [communityId, setCommunityId] = useState<number>(communities[0]?.id ?? 1)

  useEffect(() => {
    if (communities.length === 0) {
      return
    }

    const currentStillExists = communities.some((community) => community.id === communityId)
    if (!currentStillExists) {
      setCommunityId(communities[0].id)
    }
  }, [communities, communityId])

  const isValid = useMemo(
    () => title.trim().length >= 4 && description.trim().length >= 12 && communities.length > 0,
    [communities.length, description, title],
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isValid) {
      return
    }

    await onSubmit({
      title: title.trim(),
      category,
      description: description.trim(),
      priority,
      communityId,
    })

    setTitle('')
    setDescription('')
    setPriority('medium')
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-slate-800">Submit a new request</h2>
      <p className="mt-1 text-sm text-slate-500">Share what support you need from FaST Link teams and target the right entity.</p>

      <div className="mt-4 space-y-3">
        <TextInput
          label="Request title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Need partnership support for regional meetup"
          required
        />

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
            Category
          </span>
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-brand"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
            Description
          </span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand"
            placeholder="Describe goals, context, and expected timeline"
            required
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
              Priority
            </span>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as 'low' | 'medium' | 'high')}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-brand"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
              Entity
            </span>
            <select
              value={communityId}
              onChange={(event) => setCommunityId(Number(event.target.value))}
              disabled={communities.length === 0}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-brand"
            >
              {communities.length > 0 ? (
                communities.map((community) => (
                  <option key={community.id} value={community.id}>
                    {community.name}
                  </option>
                ))
              ) : (
                <option value="">No accessible entity</option>
              )}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="submit" disabled={!isValid || isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit request'}
        </Button>
      </div>
    </form>
  )
}
