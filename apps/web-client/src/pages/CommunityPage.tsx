import { useEffect } from 'react'
import { Check, LoaderCircle, UserPlus } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { Button } from '../components/atoms/Button'
import { CommunityChatPanel } from '../components/organisms/CommunityChatPanel'
import { PostCard } from '../components/organisms/PostCard'
import { useAddComment, useInfiniteFeed, useToggleLike, useToggleSavedPost } from '../hooks/useFeed'
import { useCommunity, useJoinCommunity, useMyCommunities } from '../hooks/useSocial'
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
  const { data: myCommunities = [] } = useMyCommunities()
  const joinMutation = useJoinCommunity()
  const feedQuery = useInfiniteFeed()
  const likeMutation = useToggleLike()
  const addCommentMutation = useAddComment()
  const savedMutation = useToggleSavedPost()

  const isMember = myCommunities.some((c) => c.id === communityId)

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
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {communityQuery.data?.name ?? 'Community'}
              </h1>
              <p className="mt-2 text-sm text-slate-600">{communityQuery.data?.description}</p>
            </div>

            {isMember ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
                <Check size={12} />
                Member
              </span>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                disabled={joinMutation.isPending}
                onClick={() => joinMutation.mutate(communityId)}
              >
                {joinMutation.isPending ? (
                  <LoaderCircle size={13} className="animate-spin" />
                ) : (
                  <UserPlus size={13} />
                )}
                {joinMutation.isPending ? 'Joining…' : 'Join community'}
              </Button>
            )}
          </div>
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
