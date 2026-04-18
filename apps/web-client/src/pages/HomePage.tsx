import { useEffect, useMemo, useRef } from 'react'
import { LoaderCircle } from 'lucide-react'
import { CreatePostComposer } from '../components/organisms/CreatePostComposer'
import { PostCard } from '../components/organisms/PostCard'
import { useAddComment, useCreatePost, useInfiniteFeed, useToggleLike, useToggleSavedPost } from '../hooks/useFeed'
import { useAuthStore } from '../stores/authStore'
import { env } from '../config/env'
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
    if (!target || !feedQuery.hasNextPage || feedQuery.isFetchingNextPage) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting) {
          void feedQuery.fetchNextPage()
        }
      },
      {
        rootMargin: '200px',
      },
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [feedQuery])

  return (
    <div className="space-y-4">
      <CreatePostComposer
        currentUser={currentUser}
        defaultCommunityId={env.defaultCommunityId}
        onSubmit={(input) => createPostMutation.mutateAsync(input)}
        isSubmitting={createPostMutation.isPending}
      />

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

      {feedQuery.isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
          <LoaderCircle className="animate-spin" size={16} />
          <span className="ml-2 text-sm font-medium">Loading feed...</span>
        </div>
      ) : null}

      <div ref={loadMoreRef} className="h-8" />

      {feedQuery.isFetchingNextPage ? (
        <div className="flex items-center justify-center text-sm text-slate-500">Loading more posts...</div>
      ) : null}

      {!feedQuery.hasNextPage && posts.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center text-sm text-slate-500">
          You reached the end of the feed.
        </div>
      ) : null}
    </div>
  )
}
