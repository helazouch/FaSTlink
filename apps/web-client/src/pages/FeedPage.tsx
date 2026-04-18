import { formatDistanceToNow } from 'date-fns'
import { Filter, MessageCircle, Search, Sparkles, ThumbsUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { PageHeader } from '../components/ui/PageHeader'
import { useCreatePublication, usePublications } from '../hooks/usePlatformData'

const formatRelativeDate = (value: string): string => {
  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return 'just now'
  }

  return formatDistanceToNow(parsedDate, { addSuffix: true })
}

export const FeedPage = () => {
  const { user } = useAuth()
  const { data: publications = [], isLoading } = usePublications()
  const createPublicationMutation = useCreatePublication()
  const [searchValue, setSearchValue] = useState('')
  const [activeTag, setActiveTag] = useState('All')
  const [composerContent, setComposerContent] = useState('')

  const submitPublication = async () => {
    if (!user || composerContent.trim().length === 0) {
      return
    }

    await createPublicationMutation.mutateAsync({
      userId: user.id,
      content: composerContent.trim(),
      entityIds: [Number(import.meta.env.VITE_DEFAULT_ENTITY_ID ?? '1')],
    })

    setComposerContent('')
  }

  const tags = useMemo(() => {
    const discoveredTags = new Set<string>()

    for (const publication of publications) {
      for (const tag of publication.tags) {
        discoveredTags.add(tag)
      }
    }

    return ['All', ...Array.from(discoveredTags)]
  }, [publications])

  const filteredPublications = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()

    return publications.filter((publication) => {
      const matchesTag = activeTag === 'All' || publication.tags.includes(activeTag)
      const matchesSearch =
        normalizedSearch.length === 0 ||
        publication.title.toLowerCase().includes(normalizedSearch) ||
        publication.excerpt.toLowerCase().includes(normalizedSearch) ||
        publication.community.toLowerCase().includes(normalizedSearch)

      return matchesTag && matchesSearch
    })
  }, [activeTag, publications, searchValue])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Publication Feed"
        title="Community Stories"
        subtitle="Discover updates from communities, teams and creator programs with quick filtering by topic."
        action={
          <button
            onClick={submitPublication}
            disabled={createPublicationMutation.isPending || composerContent.trim().length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Sparkles size={16} />
            {createPublicationMutation.isPending ? 'Publishing...' : 'Publish'}
          </button>
        }
      />

      <section className="glass-panel p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Create publication</p>
        <textarea
          value={composerContent}
          onChange={(event) => setComposerContent(event.target.value)}
          className="mt-3 min-h-28 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-brand-400"
          placeholder="Share an update with your communities..."
        />
        {createPublicationMutation.error ? (
          <p className="mt-2 rounded-lg border border-rose-400/35 bg-rose-500/20 px-3 py-2 text-sm text-rose-100">
            Unable to publish now. Check your JWT role and backend availability.
          </p>
        ) : null}
      </section>

      <section className="glass-panel space-y-4 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-md">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-brand-400"
              placeholder="Search posts, communities, tags"
            />
          </label>

          <div className="inline-flex items-center gap-2 text-sm text-slate-300">
            <Filter size={14} />
            {filteredPublications.length} matching posts
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                activeTag === tag
                  ? 'bg-brand-600 text-white'
                  : 'border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        {isLoading ? (
          <div className="glass-panel animate-pulse p-8 text-center text-slate-300">
            Loading publications...
          </div>
        ) : null}

        {!isLoading && filteredPublications.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-300">
            No publication matches this filter.
          </div>
        ) : null}

        {filteredPublications.map((publication, index) => (
          <article
            key={publication.id}
            className="glass-panel animate-rise p-6"
            style={{ animationDelay: `${Math.min(index * 80, 240)}ms` }}
          >
            <div className="flex flex-wrap items-center gap-2">
              {publication.isPinned ? (
                <span className="rounded-full bg-brand-500/20 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-200">
                  Pinned
                </span>
              ) : null}
              {publication.tags.map((tag) => (
                <span
                  key={`${publication.id}-${tag}`}
                  className="rounded-full border border-white/15 px-2 py-1 text-[11px] uppercase tracking-[0.1em] text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h3 className="mt-3 text-2xl font-semibold text-white">{publication.title}</h3>
            <p className="mt-3 text-sm text-slate-300">{publication.excerpt}</p>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <div>
                <p className="font-semibold uppercase tracking-[0.1em] text-slate-300">
                  {publication.author}
                </p>
                <p>{publication.community}</p>
              </div>

              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1">
                  <ThumbsUp size={14} />
                  {publication.reactions}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle size={14} />
                  {publication.comments}
                </span>
                <span>{formatRelativeDate(publication.createdAt)}</span>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
