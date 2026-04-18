import { PostCard } from '../components/organisms/PostCard'
import { useAddComment, useInfiniteFeed, useToggleLike, useToggleSavedPost } from '../hooks/useFeed'
import { useAuthStore } from '../stores/authStore'
import type { UserSummary } from '../types/social'

const toCurrentUser = (
  user: ReturnType<typeof useAuthStore.getState>['user'],
): UserSummary => ({
  id: user?.id ?? 0,
  fullName: user?.fullName ?? 'FaST Link member',
  headline: user?.headline ?? 'Community member',
  avatarUrl: user?.avatarUrl,
})

export const SavedItemsPage = () => {
  const user = useAuthStore((state) => state.user)
  const currentUser = toCurrentUser(user)
  const feedQuery = useInfiniteFeed()
  const likeMutation = useToggleLike()
  const addCommentMutation = useAddComment()
  const savedMutation = useToggleSavedPost()

  const savedPosts =
    feedQuery.data?.pages.flatMap((page) => page.items).filter((item) => item.savedByMe) ?? []

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Saved items</h1>
        <p className="mt-1 text-sm text-slate-500">
          Quick access to posts you bookmarked for follow-up.
        </p>
      </section>

      {savedPosts.length > 0 ? (
        savedPosts.map((post) => (
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
        ))
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
          No saved posts yet. Use the Save action in the feed.
        </div>
      )}
    </div>
  )
}
