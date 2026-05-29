import { useEffect, useMemo, useRef } from 'react'
import { AlertCircle, LoaderCircle } from 'lucide-react'
import { PostCard } from '../components/organisms/PostCard'
import { useAddComment, useToggleLike, useToggleSavedPost } from '../hooks/useFeed'
import { useInfiniteSavedPosts } from '../hooks/useSavedPosts'
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
  const currentUser = useMemo(() => toCurrentUser(user), [user])
  const savedQuery = useInfiniteSavedPosts()
  const likeMutation = useToggleLike()
  const addCommentMutation = useAddComment()
  const savedMutation = useToggleSavedPost()
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const savedPosts = useMemo(
    () => savedQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [savedQuery.data?.pages],
  )

  useEffect(() => {
    const target = loadMoreRef.current
    if (!target || !savedQuery.hasNextPage || savedQuery.isFetchingNextPage) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting) {
          void savedQuery.fetchNextPage()
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
  }, [savedQuery])

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Saved items</h1>
        <p className="mt-1 text-sm text-slate-500">
          Quick access to posts you bookmarked for follow-up.
        </p>
      </section>

      {savedQuery.isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          <LoaderCircle className="h-5 w-5 animate-spin text-slate-400" />
          Loading saved posts...
        </div>
      ) : savedQuery.isError ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Unable to load saved posts</p>
            <p className="mt-1 text-red-600">
              {savedQuery.error instanceof Error
                ? savedQuery.error.message
                : 'Please refresh the page and try again.'}
            </p>
          </div>
        </div>
      ) : savedPosts.length > 0 ? (
        <>
          {savedPosts.map((post) => (
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
          <div ref={loadMoreRef} className="h-1" />
          {savedQuery.isFetchingNextPage ? (
            <div className="flex items-center justify-center gap-2 py-2 text-sm text-slate-500">
              <LoaderCircle className="h-4 w-4 animate-spin text-slate-400" />
              Loading more...
            </div>
          ) : null}
        </>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
          No saved posts yet. Use the Save action in the feed.
        </div>
      )}
    </div>
  )
}
