import { useMemo } from 'react'
import { Avatar } from '../atoms/Avatar'
import { CommentComposer } from '../molecules/CommentComposer'
import { PostActions } from '../molecules/PostActions'
import { formatRelativeTime } from '../../lib/date'
import { useFeedStore } from '../../stores/feedStore'
import type { FeedPost, UserSummary } from '../../types/social'

interface PostCardProps {
  post: FeedPost
  currentUser: UserSummary
  onToggleLike: (postId: string) => void
  onToggleSaved: (postId: string) => void
  onAddComment: (postId: string, content: string) => Promise<unknown>
}

export const PostCard = ({
  post,
  currentUser,
  onToggleLike,
  onToggleSaved,
  onAddComment,
}: PostCardProps) => {
  const expandedCommentsByPostId = useFeedStore((state) => state.expandedCommentsByPostId)
  const toggleComments = useFeedStore((state) => state.toggleComments)

  const commentsOpen = Boolean(expandedCommentsByPostId[post.id])

  const mediaGridClassName = useMemo(() => {
    if (post.media.length <= 1) {
      return 'grid-cols-1'
    }

    return 'grid-cols-2'
  }, [post.media.length])

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Avatar name={post.author.fullName} />
          <div>
            <p className="text-sm font-semibold text-slate-800">{post.author.fullName}</p>
            <p className="text-xs text-slate-500">{post.entity}</p>
          </div>
        </div>
        <span className="text-xs text-slate-400">{formatRelativeTime(post.createdAt)}</span>
      </header>

      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">{post.content}</p>

      {post.media.length > 0 ? (
        <div className={`mt-3 grid gap-2 ${mediaGridClassName}`}>
          {post.media.map((item) => (
            <img
              key={item.id}
              src={item.url}
              alt={item.name}
              className="h-52 w-full rounded-xl object-cover"
            />
          ))}
        </div>
      ) : null}

      <PostActions
        liked={post.likedByMe}
        saved={post.savedByMe}
        likeCount={post.likeCount}
        commentCount={post.commentCount}
        shareCount={post.shareCount}
        onToggleLike={() => onToggleLike(post.id)}
        onToggleComments={() => toggleComments(post.id)}
        onShare={() => {
          void navigator.clipboard?.writeText(window.location.href)
        }}
        onToggleSaved={() => onToggleSaved(post.id)}
      />

      {commentsOpen ? (
        <section className="mt-2 rounded-xl bg-slate-50/80 p-3">
          <div className="space-y-2">
            {post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment.id} className="rounded-xl bg-white px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Avatar name={comment.author.fullName} size="sm" />
                    <p className="text-xs font-semibold text-slate-700">{comment.author.fullName}</p>
                    <span className="text-[11px] text-slate-400">{formatRelativeTime(comment.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{comment.content}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No comments yet. Start the conversation.</p>
            )}
          </div>

          <CommentComposer
            onSubmit={(content) => onAddComment(post.id, content)}
            disabled={currentUser.id <= 0}
          />
        </section>
      ) : null}
    </article>
  )
}
