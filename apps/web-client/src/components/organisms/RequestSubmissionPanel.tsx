import { useMemo, useState, type FormEvent } from 'react'
import { PermissionAwareButton } from '../auth/PermissionAwareButton'
import { TextInput } from '../atoms/TextInput'
import type { CommunitySummary, SubmitRequestInput } from '../../types/social'

interface RequestSubmissionPanelProps {
  entity: CommunitySummary | null
  canSubmit: boolean
  onSubmit: (input: SubmitRequestInput) => Promise<unknown>
  isSubmitting: boolean
}

export const RequestSubmissionPanel = ({
  entity,
  canSubmit,
  onSubmit,
  isSubmitting,
}: RequestSubmissionPanelProps) => {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<SubmitRequestInput['type']>('MATERIAL_REQUEST')
  const [description, setDescription] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [heureDebut, setHeureDebut] = useState('09:00')
  const [heureFin, setHeureFin] = useState('11:00')
  const [typeMateriel, setTypeMateriel] = useState('')
  const [quantite, setQuantite] = useState(1)
  const [roomCapacities, setRoomCapacities] = useState<number[]>([20])

  const dateTimeError = useMemo(() => {
    if (!dateDebut || !dateFin || !heureDebut || !heureFin) return null
    const start = new Date(`${dateDebut}T${heureDebut}`)
    const end = new Date(`${dateFin}T${heureFin}`)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'Invalid date or time.'
    return end > start ? null : 'End datetime must be strictly after start datetime.'
  }, [dateDebut, dateFin, heureDebut, heureFin])

  const disabledReason = useMemo(() => {
    if (!entity) return 'Select an entity before submitting.'
    if (!canSubmit) return 'You need a BUREAU_MEMBER role for this entity.'
    if (title.trim().length < 4) return 'Request object must contain at least 4 characters.'
    if (description.trim().length < 8) return 'Description must contain at least 8 characters.'
    if (!dateDebut || !dateFin || !heureDebut || !heureFin) return 'Start and end date/time are required.'
    if (dateTimeError) return dateTimeError
    if (type === 'MATERIAL_REQUEST') {
      if (!typeMateriel.trim()) return 'Material type is required.'
      if (quantite <= 0) return 'Quantity must be positive.'
    }
    if (type === 'ROOM_RESERVATION') {
      if (roomCapacities.length === 0) return 'At least one room is required.'
      if (!roomCapacities.every((capacity) => capacity > 0)) return 'Every requested room capacity must be positive.'
    }
    return null
  }, [canSubmit, dateDebut, dateFin, dateTimeError, description, entity, heureDebut, heureFin, quantite, roomCapacities, title, type, typeMateriel])

  const isValid = useMemo(() => {
    return disabledReason === null
  }, [disabledReason])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isValid || !entity) return

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      communityId: entity.id,
      type,
      dateDebut,
      dateFin,
      heureDebut,
      heureFin,
      typeMateriel: type === 'MATERIAL_REQUEST' ? typeMateriel.trim() : undefined,
      quantite: type === 'MATERIAL_REQUEST' ? quantite : undefined,
      sallesDemandees: type === 'ROOM_RESERVATION'
        ? roomCapacities.map((capaciteSouhaitee) => ({ capaciteSouhaitee }))
        : [],
    })

    setTitle('')
    setDescription('')
    setTypeMateriel('')
    setQuantite(1)
    setRoomCapacities([20])
  }

  if (!entity || !canSubmit) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">Submit a new request</h2>
        <p className="mt-2 text-sm text-slate-500">
          You need a BUREAU_MEMBER role in the currently selected entity to submit requests.
        </p>
      </section>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-slate-800">Submit a new request</h2>
      <p className="mt-1 text-sm text-slate-500">Requests are submitted for {entity.name}.</p>

      <div className="mt-4 space-y-3">
        <TextInput
          label="Request object"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Video projector for meetup"
          required
        />

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Type</span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as SubmitRequestInput['type'])}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-brand"
          >
            <option value="MATERIAL_REQUEST">Material request</option>
            <option value="ROOM_RESERVATION">Room reservation</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand"
            placeholder="Describe the need, context, and constraints"
            required
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <TextInput label="Start date" type="date" value={dateDebut} onChange={(event) => setDateDebut(event.target.value)} required />
          <TextInput label="End date" type="date" value={dateFin} onChange={(event) => setDateFin(event.target.value)} required />
          <TextInput label="Start time" type="time" value={heureDebut} onChange={(event) => setHeureDebut(event.target.value)} required />
          <TextInput label="End time" type="time" value={heureFin} onChange={(event) => setHeureFin(event.target.value)} required />
        </div>
        {dateTimeError ? <p className="text-sm font-semibold text-rose-600">{dateTimeError}</p> : null}

        {type === 'MATERIAL_REQUEST' ? (
          <div className="grid gap-3 md:grid-cols-2">
            <TextInput
              label="Material type"
              value={typeMateriel}
              onChange={(event) => setTypeMateriel(event.target.value)}
              placeholder="Projector, chairs, sound system"
              required
            />
            <TextInput
              label="Quantity"
              type="number"
              min={1}
              value={quantite}
              onChange={(event) => setQuantite(Number(event.target.value))}
              required
            />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Requested rooms</span>
              <button
                type="button"
                onClick={() => setRoomCapacities((current) => [...current, 20])}
                className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand"
              >
                Add room
              </button>
            </div>
            {roomCapacities.map((capacity, index) => (
              <div key={index} className="flex items-center gap-2">
                <TextInput
                  label={`Capacity ${index + 1}`}
                  type="number"
                  min={1}
                  value={capacity}
                  onChange={(event) =>
                    setRoomCapacities((current) => current.map((item, itemIndex) => (itemIndex === index ? Number(event.target.value) : item)))
                  }
                  required
                />
                {roomCapacities.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setRoomCapacities((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                    className="mt-6 h-10 rounded-lg bg-rose-50 px-3 text-sm font-bold text-rose-600"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {disabledReason ? (
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
          {disabledReason}
        </p>
      ) : null}

      <div className="mt-4 flex justify-end">
        <PermissionAwareButton
          type="submit"
          permission="REQUEST_SUBMIT"
          entityId={entity.id}
          disabled={!isValid || isSubmitting}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Submitting...' : 'Submit request'}
        </PermissionAwareButton>
      </div>
    </form>
  )
}
