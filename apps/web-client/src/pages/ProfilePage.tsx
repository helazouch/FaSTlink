import { LoaderCircle, MapPin } from 'lucide-react'
import { Avatar } from '../components/atoms/Avatar'
import { Badge } from '../components/atoms/Badge'
import { useInfiniteFeed } from '../hooks/useFeed'
import { useProfile } from '../hooks/useSocial'
import { formatDateTime } from '../lib/date'

export const ProfilePage = () => {
  const profileQuery = useProfile()
  const feedQuery = useInfiniteFeed()

  if (profileQuery.isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
        <LoaderCircle className="animate-spin" size={16} />
        <span className="ml-2 text-sm font-medium">Loading profile...</span>
      </div>
    )
  }

  if (!profileQuery.data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        Unable to load profile right now.
      </div>
    )
  }

  const profile = profileQuery.data
  const posts =
    feedQuery.data?.pages
      .flatMap((page) => page.items)
      .filter((item) => item.author.id === profile.id)
      .slice(0, 4) ?? []

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar name={profile.fullName} size="lg" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{profile.fullName}</h1>
            <p className="mt-1 text-sm text-slate-600">{profile.headline}</p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500">
              <MapPin size={12} />
              {profile.location}
            </p>
            <p className="mt-1 text-xs text-slate-500">Joined {formatDateTime(profile.joinedAt)}</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-700">{profile.bio}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Followers</p>
            <p className="mt-1 text-xl font-bold text-slate-800">{profile.stats.followers}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Following</p>
            <p className="mt-1 text-xl font-bold text-slate-800">{profile.stats.following}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Posts</p>
            <p className="mt-1 text-xl font-bold text-slate-800">{profile.stats.posts}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {profile.interests.map((interest) => (
            <Badge key={interest}>{interest}</Badge>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Recent posts</h2>
        <div className="mt-3 space-y-3">
          {posts.length > 0 ? (
            posts.map((post) => (
              <article key={post.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-sm text-slate-700">{post.content}</p>
                <p className="mt-2 text-xs text-slate-500">{formatDateTime(post.createdAt)}</p>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-500">No recent posts yet.</p>
          )}
        </div>
      </section>
    </div>
  )
}
