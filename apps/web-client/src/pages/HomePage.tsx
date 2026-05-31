import { useEffect, useMemo, useRef } from 'react'
import { AlertCircle, LoaderCircle } from 'lucide-react'
import { CreatePostComposer } from '../components/organisms/CreatePostComposer'
import { PostCard } from '../components/organisms/PostCard'
import { useAddComment, useCreatePost, useInfiniteFeed, useToggleLike, useToggleSavedPost } from '../hooks/useFeed'
import { useAuthStore } from '../stores/authStore'
import { normalizeApiError } from '../lib/errors'
import type { UserSummary } from '../types/social'

const toUserSummary = (
  user: ReturnType<typeof useAuthStore.getState>['user'],
): UserSummary => ({
  id: user?.id ?? 0,
  fullName: user?.fullName ?? 'FaST Link member',
  headline: user?.headline ?? 'Community member',
  avatarUrl: user?.avatarUrl,
})

export const HomePage = () => {
  const user = useAuthStore((state) => state.user)
  const feedQuery = useInfiniteFeed()
  const createPostMutation = useCreatePost()
  const likeMutation = useToggleLike()
  const addCommentMutation = useAddComment()
  const toggleSavedMutation = useToggleSavedPost()

  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const currentUser = useMemo(() => toUserSummary(user), [user])

  const posts = useMemo(
    () => feedQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [feedQuery.data?.pages],
  )

  useEffect(() => {
    const target = loadMoreRef.current
    if (!target || !feedQuery.hasNextPage || feedQuery.isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting) {
          void feedQuery.fetchNextPage()
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [feedQuery])

  const postError = createPostMutation.error
    ? normalizeApiError(createPostMutation.error).message
    : null

  return (
    <div className="space-y-4">
      {postError ? (
        <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {postError}
        </div>
      ) : null}

      <CreatePostComposer
        currentUser={currentUser}
        defaultCommunityId={0}
        onSubmit={(input) => createPostMutation.mutateAsync(input)}
        isSubmitting={createPostMutation.isPending}
      />

      {feedQuery.isError ? (
        <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          Unable to load the feed. Make sure the API Gateway is running.
        </div>
      ) : null}

      {feedQuery.isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
          <LoaderCircle className="animate-spin" size={16} />
          <span className="ml-2 text-sm font-medium">Loading feed...</span>
        </div>
      ) : null}

      {!feedQuery.isLoading && !feedQuery.isError && posts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          No publications yet. Be the first to post something!
        </div>
      ) : null}

      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUser={currentUser}
          onToggleLike={(postId) => likeMutation.mutate(postId)}
          onToggleSaved={(postId) => toggleSavedMutation.mutate(postId)}
          onAddComment={(postId, content) =>
            addCommentMutation.mutateAsync({
              postId,
              content,
              author: currentUser,
            })
          }
        />
      ))}

      <div ref={loadMoreRef} className="h-8" />

      {feedQuery.isFetchingNextPage ? (
        <div className="flex items-center justify-center text-sm text-slate-500">
          Loading more posts...
        </div>
      ) : null}

      {!feedQuery.hasNextPage && posts.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center text-sm text-slate-500">
          You reached the end of the feed.
        </div>
      ) : null}
    </div>
  )
}
