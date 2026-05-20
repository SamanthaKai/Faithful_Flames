'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { FORUM_TOPIC_MAP } from '@/lib/forum-topics'

interface Reply {
  id: string
  userId: string
  content: string
  createdAt: string
  user: { name: string | null }
}

interface Post {
  id: string
  userId: string
  title: string
  content: string
  topic: string
  createdAt: string
  user: { name: string | null }
  replies: Reply[]
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
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null)

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
    const res = await fetch(`/api/forum/posts/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Post deleted.')
      router.push('/forum')
    } else {
      setDeletingPost(false)
      toast.error('Failed to delete post.')
    }
  }

  const handleDeleteReply = async (replyId: string) => {
    setDeletingReplyId(replyId)
    const res = await fetch(`/api/forum/replies/${replyId}`, { method: 'DELETE' })
    setDeletingReplyId(null)
    if (res.ok) {
      setPost((p) => p ? { ...p, replies: p.replies.filter((r) => r.id !== replyId) } : p)
      toast.success('Reply deleted.')
    } else {
      toast.error('Failed to delete reply.')
    }
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
      setPost((p) => p ? { ...p, replies: [...p.replies, reply] } : p)
      setReplyContent('')
      toast.success('Reply posted!')
    } else {
      const { error } = await res.json()
      toast.error(error ?? 'Failed to post reply.')
    }
  }

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

  const initial = (post.user.name?.[0] ?? '?').toUpperCase()
  const topicLabel = FORUM_TOPIC_MAP[post.topic]?.label ?? post.topic
  const isOwner = !!session && session.user.id === post.userId

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <Link href="/forum" className="text-sm text-warm-gray hover:text-primary transition-colors mb-6 inline-flex items-center gap-1">
        ← Back to Forum
      </Link>

      <article className="card p-6 md:p-8 mb-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {topicLabel}
            </span>
            <p className="text-sm text-warm-gray mt-1">
              {post.user.name} · {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
                {savingEdit ? 'Saving…' : 'Save'}
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

            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-gray-100 dark:border-[#3A3030]">
              {isOwner ? (
                <>
                  <button type="button" onClick={handleStartEdit} className="text-xs text-warm-gray hover:text-primary transition-colors">
                    Edit
                  </button>
                  <button type="button" onClick={handleDeletePost} disabled={deletingPost} className="text-xs text-warm-gray hover:text-red-500 transition-colors disabled:opacity-50">
                    {deletingPost ? 'Deleting…' : 'Delete'}
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
          {post.replies.length} {post.replies.length === 1 ? 'Reply' : 'Replies'}
        </h2>

        <div className="space-y-4 mb-8">
          {post.replies.map((reply) => {
            const isReplyOwner = !!session && session.user.id === reply.userId
            return (
              <div key={reply.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-sm flex-shrink-0">
                  {(reply.user.name?.[0] ?? '?').toUpperCase()}
                </div>
                <div className="card p-4 flex-1">
                  <p className="text-sm font-semibold text-charcoal dark:text-cream mb-1">{reply.user.name}</p>
                  <p className="text-charcoal dark:text-cream/90 text-sm leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-xs text-warm-gray">
                      {new Date(reply.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    {isReplyOwner && (
                      <button
                        type="button"
                        onClick={() => handleDeleteReply(reply.id)}
                        disabled={deletingReplyId === reply.id}
                        className="text-xs text-warm-gray hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        {deletingReplyId === reply.id ? 'Deleting…' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

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
              placeholder="Share your thoughts or encouragement…"
            />
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Posting…' : 'Post reply'}
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
