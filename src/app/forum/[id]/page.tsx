'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { FORUM_TOPIC_MAP } from '@/lib/forum-topics'
import { timeAgo } from '@/lib/time'
import { PrayButton } from '@/components/PrayButton'
import { LikeButton } from '@/components/LikeButton'
import { UserAvatar } from '@/components/UserAvatar'

interface Child {
  id: string
  userId: string
  content: string
  createdAt: string
  updatedAt: string
  user: { name: string | null; image: string | null }
}

interface Reply {
  id: string
  userId: string
  content: string
  createdAt: string
  updatedAt: string
  user: { name: string | null; image: string | null }
  children: Child[]
}

interface Post {
  id: string
  userId: string
  title: string
  content: string
  topic: string
  createdAt: string
  user: { name: string | null; image: string | null }
  replies: Reply[]
}

function ReplyCard({
  reply,
  session,
  onDelete,
  onEdit,
  postId,
  onNewChild,
  depth = 0,
}: {
  reply: Reply | Child
  session: ReturnType<typeof useSession>['data']
  onDelete: (id: string, parentId?: string) => void
  onEdit: (id: string, content: string, parentId?: string) => void
  postId: string
  onNewChild: (child: Child, parentId: string) => void
  depth?: number
}) {
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(reply.content)
  const [saving, setSaving] = useState(false)

  const isOwner = !!session && session.user.id === reply.userId
  const isAdmin = !!session && session.user.role === 'ADMIN'
  const canManage = isOwner || isAdmin

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim()) return
    setSubmitting(true)
    const res = await fetch('/api/forum/replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, content: replyText, parentId: reply.id }),
    })
    setSubmitting(false)
    if (res.ok) {
      const child = await res.json()
      onNewChild(child, reply.id)
      setReplyText('')
      setShowReply(false)
      toast.success('Reply posted!')
    } else {
      const { error } = await res.json()
      toast.error(error ?? 'Failed to post reply.')
    }
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch(`/api/forum/replies/${reply.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editText }),
    })
    setSaving(false)
    if (res.ok) {
      onEdit(reply.id, editText, (reply as Child & { parentId?: string }).parentId ?? undefined)
      setEditing(false)
      toast.success('Reply updated.')
    } else {
      const { error } = await res.json()
      toast.error(error ?? 'Failed to update reply.')
    }
  }

  return (
    <div className={depth > 0 ? 'ml-8 mt-3' : ''}>
      <div className="flex gap-3">
        <div className="mt-1">
          <UserAvatar src={reply.user.image} name={reply.user.name} size={32} />
        </div>
        <div className="card p-4 flex-1">
          <p className="text-sm font-semibold text-charcoal dark:text-cream mb-1">{reply.user.name}</p>

          {editing ? (
            <form onSubmit={handleSaveEdit} className="space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                placeholder="Reply content"
                aria-label="Edit reply"
                className="input resize-none w-full text-sm"
              />
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="btn-primary text-xs px-3 py-1.5">
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="btn-outline text-xs px-3 py-1.5">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="text-charcoal dark:text-cream/90 text-sm leading-relaxed whitespace-pre-wrap">{reply.content}</p>
          )}

          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <p className="text-xs text-warm-gray">
              {timeAgo(reply.createdAt)}
            </p>
            {depth === 0 && session && (
              <button
                type="button"
                onClick={() => setShowReply((v) => !v)}
                className="text-xs text-warm-gray hover:text-primary transition-colors"
              >
                Reply
              </button>
            )}
            {canManage && !editing && (
              <>
                <button
                  type="button"
                  onClick={() => { setEditText(reply.content); setEditing(true) }}
                  className="text-xs text-warm-gray hover:text-primary transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(reply.id, (reply as Child & { parentId?: string }).parentId ?? undefined)}
                  className="text-xs text-warm-gray hover:text-red-500 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>

          {showReply && (
            <form onSubmit={handleSubmitReply} className="mt-3 space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                className="input resize-none w-full text-sm"
                placeholder="Write a reply..."
              />
              <div className="flex gap-2">
                <button type="submit" disabled={submitting} className="btn-primary text-xs px-3 py-1.5">
                  {submitting ? 'Posting...' : 'Post'}
                </button>
                <button type="button" onClick={() => setShowReply(false)} className="btn-outline text-xs px-3 py-1.5">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {'children' in reply && reply.children.map((child) => (
        <ReplyCard
          key={child.id}
          reply={child}
          session={session}
          onDelete={onDelete}
          onEdit={onEdit}
          postId={postId}
          onNewChild={onNewChild}
          depth={1}
        />
      ))}
    </div>
  )
}

export default function ForumPostPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const router = useRouter()

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', content: '' })
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingPost, setDeletingPost] = useState(false)

  useEffect(() => {
    fetch(`/api/forum/posts/${id}`)
      .then((r) => r.json())
      .then((data) => { setPost(data); setLoading(false) })
  }, [id])

  const handleReport = async () => {
    await fetch(`/api/forum/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFlagged: true }),
    })
    toast.success('Post reported. Thank you.')
  }

  const handleStartEdit = () => {
    if (!post) return
    setEditForm({ title: post.title, content: post.content })
    setEditing(true)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingEdit(true)
    const res = await fetch(`/api/forum/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editForm.title, content: editForm.content }),
    })
    setSavingEdit(false)
    if (res.ok) {
      setPost((p) => p ? { ...p, title: editForm.title, content: editForm.content } : p)
      setEditing(false)
      toast.success('Post updated.')
    } else {
      const { error } = await res.json()
      toast.error(error ?? 'Failed to update post.')
    }
  }

  const handleDeletePost = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) return
    setDeletingPost(true)
    try {
      const res = await fetch(`/api/forum/posts/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Post deleted.')
        router.refresh()
        router.push('/forum')
      } else {
        const data = await res.json().catch(() => ({}))
        setDeletingPost(false)
        toast.error((data as { error?: string }).error ?? 'Failed to delete post.')
      }
    } catch {
      setDeletingPost(false)
      toast.error('Network error. Please try again.')
    }
  }

  const handleDeleteReply = async (replyId: string, parentId?: string) => {
    if (!confirm('Delete this reply?')) return
    const res = await fetch(`/api/forum/replies/${replyId}`, { method: 'DELETE' })
    if (res.ok) {
      if (parentId) {
        setPost((p) => p ? {
          ...p,
          replies: p.replies.map((r) =>
            r.id === parentId ? { ...r, children: r.children.filter((c) => c.id !== replyId) } : r
          ),
        } : p)
      } else {
        setPost((p) => p ? { ...p, replies: p.replies.filter((r) => r.id !== replyId) } : p)
      }
      toast.success('Reply deleted.')
    } else {
      toast.error('Failed to delete reply.')
    }
  }

  const handleEditReply = (replyId: string, newContent: string, parentId?: string) => {
    if (parentId) {
      setPost((p) => p ? {
        ...p,
        replies: p.replies.map((r) =>
          r.id === parentId
            ? { ...r, children: r.children.map((c) => c.id === replyId ? { ...c, content: newContent } : c) }
            : r
        ),
      } : p)
    } else {
      setPost((p) => p ? {
        ...p,
        replies: p.replies.map((r) => r.id === replyId ? { ...r, content: newContent } : r),
      } : p)
    }
  }

  const handleNewChild = (child: Child, parentId: string) => {
    setPost((p) => p ? {
      ...p,
      replies: p.replies.map((r) =>
        r.id === parentId ? { ...r, children: [...r.children, child] } : r
      ),
    } : p)
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim()) return
    setSubmitting(true)
    const res = await fetch('/api/forum/replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: id, content: replyContent }),
    })
    setSubmitting(false)
    if (res.ok) {
      const reply = await res.json()
      setPost((p) => p ? { ...p, replies: [...p.replies, { ...reply, children: [] }] } : p)
      setReplyContent('')
      toast.success('Reply posted!')
    } else {
      const { error } = await res.json()
      toast.error(error ?? 'Failed to post reply.')
    }
  }

  const totalReplies = post
    ? post.replies.reduce((acc, r) => acc + 1 + r.children.length, 0)
    : 0

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="skeleton h-8 w-64 rounded mb-4" />
      <div className="skeleton h-4 w-full rounded mb-2" />
      <div className="skeleton h-4 w-3/4 rounded" />
    </div>
  )

  if (!post) return (
    <div className="text-center py-24 text-warm-gray">
      <p>Post not found.</p>
      <Link href="/forum" className="text-primary mt-4 inline-block">← Back to Forum</Link>
    </div>
  )

  const topicLabel = FORUM_TOPIC_MAP[post.topic]?.label ?? post.topic
  const isOwner = !!session && session.user.id === post.userId
  const canManage = isOwner || (!!session && session.user.role === 'ADMIN')

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <Link href="/forum" className="text-sm text-warm-gray hover:text-primary transition-colors mb-6 inline-flex items-center gap-1">
        ← Back to Forum
      </Link>

      <article className="card p-6 md:p-8 mb-8">
        <div className="flex items-start gap-4 mb-4">
          <UserAvatar src={post.user.image} name={post.user.name} size={40} />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {topicLabel}
            </span>
            <p className="text-sm text-warm-gray mt-1">
              {post.user.name} · {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSaveEdit} className="space-y-3">
            <input
              value={editForm.title}
              onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
              required
              placeholder="Post title"
              aria-label="Post title"
              className="input font-heading text-xl font-bold w-full"
            />
            <textarea
              value={editForm.content}
              onChange={(e) => setEditForm((p) => ({ ...p, content: e.target.value }))}
              required
              rows={6}
              placeholder="Post content"
              aria-label="Post content"
              className="input resize-none w-full"
            />
            <div className="flex gap-2">
              <button type="submit" disabled={savingEdit} className="btn-primary text-sm px-4 py-2">
                {savingEdit ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn-outline text-sm px-4 py-2">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-charcoal dark:text-cream mb-4">{post.title}</h1>
            <p className="text-charcoal dark:text-cream/90 leading-relaxed whitespace-pre-wrap">{post.content}</p>

            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-[#3A3030] flex items-center gap-3 flex-wrap">
              <LikeButton contentType="FORUM_POST" contentId={post.id} />
              {post.topic === 'PRAYER_REQUESTS' && <PrayButton postId={post.id} />}
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-[#3A3030]">
              {canManage ? (
                <>
                  <button type="button" onClick={handleStartEdit} className="text-xs text-warm-gray hover:text-primary transition-colors">
                    Edit
                  </button>
                  <button type="button" onClick={handleDeletePost} disabled={deletingPost} className="text-xs text-warm-gray hover:text-red-500 transition-colors disabled:opacity-50">
                    {deletingPost ? 'Deleting...' : 'Delete'}
                  </button>
                </>
              ) : (
                session && (
                  <button type="button" onClick={handleReport} className="text-xs text-warm-gray hover:text-red-500 transition-colors">
                    Report post
                  </button>
                )
              )}
            </div>
          </>
        )}
      </article>

      {/* Replies */}
      <section>
        <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-4">
          {totalReplies} {totalReplies === 1 ? 'Reply' : 'Replies'}
        </h2>

        <div className="space-y-4 mb-8">
          {post.replies.map((reply) => (
            <ReplyCard
              key={reply.id}
              reply={reply}
              session={session}
              onDelete={handleDeleteReply}
              onEdit={handleEditReply}
              postId={id}
              onNewChild={handleNewChild}
              depth={0}
            />
          ))}

          {post.replies.length === 0 && (
            <p className="text-warm-gray text-sm">No replies yet. Be the first to respond!</p>
          )}
        </div>

        {session ? (
          <form onSubmit={handleReply} className="card p-5">
            <p className="text-sm font-medium text-charcoal dark:text-cream mb-3">Leave a reply</p>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              required
              rows={3}
              className="input resize-none mb-3"
              placeholder="Share your thoughts or encouragement..."
            />
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Posting...' : 'Post reply'}
            </button>
          </form>
        ) : (
          <div className="card p-5 text-center">
            <p className="text-warm-gray text-sm mb-3">Sign in to join the conversation</p>
            <Link href="/login" className="btn-primary">Sign in</Link>
          </div>
        )}
      </section>
    </div>
  )
}
