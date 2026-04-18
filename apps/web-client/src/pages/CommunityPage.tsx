import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CommunityChatPanel } from '../components/organisms/CommunityChatPanel'
import { PostCard } from '../components/organisms/PostCard'
import { useAddComment, useInfiniteFeed, useToggleLike, useToggleSavedPost } from '../hooks/useFeed'
import { useCommunity } from '../hooks/useSocial'
import { useAuthStore } from '../stores/authStore'
import { useFeedStore } from '../stores/feedStore'
import type { UserSummary } from '../types/social'

const toCurrentUser = (
  user: ReturnType<typeof useAuthStore.getState>['user'],
): UserSummary => ({
  id: user?.id ?? 0,
  fullName: user?.fullName ?? 'FaST Link member',
  headline: user?.headline ?? 'Community member',
  avatarUrl: user?.avatarUrl,
})

export const CommunityPage = () => {
  const params = useParams<{ communityId: string }>()
  const communityId = Number(params.communityId)
  const setActiveCommunityId = useFeedStore((state) => state.setActiveCommunityId)

  const user = useAuthStore((state) => state.user)
  const currentUser = toCurrentUser(user)

  const communityQuery = useCommunity(communityId)
  const feedQuery = useInfiniteFeed()
  const likeMutation = useToggleLike()
  const addCommentMutation = useAddComment()
  const savedMutation = useToggleSavedPost()

  useEffect(() => {
    if (Number.isFinite(communityId)) {
      setActiveCommunityId(communityId)
    }

    return () => {
      setActiveCommunityId(null)
    }
  }, [communityId, setActiveCommunityId])

  const posts = feedQuery.data?.pages.flatMap((page) => page.items) ?? []

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr,360px]">
      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800">
            {communityQuery.data?.name ?? 'Community'}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{communityQuery.data?.description}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-brand">
            {(communityQuery.data?.members ?? 0).toLocaleString()} members
          </p>
        </section>

        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={currentUser}
            onToggleLike={(postId) => likeMutation.mutate(postId)}
            onToggleSaved={(postId) => savedMutation.mutate(postId)}
            onAddComment={(postId, content) =>
              addCommentMutation.mutateAsync({
                postId,
                content,
                author: currentUser,
              })
            }
          />
        ))}
      </div>

      <CommunityChatPanel communityId={Number.isFinite(communityId) ? communityId : 1} />
    </div>
  )
}
