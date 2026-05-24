'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { UserAvatar } from '@/components/UserAvatar'

interface Comment {
  id: string
  userId: string
  content: string
  createdAt: string
  user: { id: string; name: string | null; image: string | null }
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

interface Props {
  contentType: string
  contentId: string
}

export function CommentsSection({ contentType, contentId }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/comments?contentType=${contentType}&contentId=${contentId}`)
      .then((r) => r.json())
      .then((data) => { setComments(data); setLoading(false) })
  }, [contentType, contentId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    if (!session) { router.push('/login'); return }
    setSubmitting(true)
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType, contentId, content: text }),
    })
    setSubmitting(false)
    if (res.ok) {
      const comment = await res.json()
      setComments((prev) => [...prev, comment])
      setText('')
    } else {
      toast.error('Failed to post comment.')
    }
  }

  const handleEdit = async (id: string) => {
    if (!editText.trim()) return
    const res = await fetch(`/api/comments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editText }),
    })
    if (res.ok) {
      const updated = await res.json()
      setComments((prev) => prev.map((c) => (c.id === id ? updated : c)))
      setEditingId(null)
    } else {
      toast.error('Failed to update comment.')
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== id))
    } else {
      toast.error('Failed to delete comment.')
    }
  }

  return (
    <section className="mt-10 border-t border-lm-border dark:border-ember/10 pt-8">
      <h2 className="font-heading text-lg font-bold text-lm-text dark:text-[#FFF4E8] mb-6">
        {loading ? 'Comments' : comments.length > 0 ? `${comments.length} Comment${comments.length !== 1 ? 's' : ''}` : 'Comments'}
      </h2>

      {session ? (
        <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
          <div className="w-8 h-8 rounded-full bg-lm-accent/15 dark:bg-ember/15 flex items-center justify-center text-xs font-bold text-lm-accent dark:text-ember flex-shrink-0 mt-1">
            {(session.user.name?.[0] ?? session.user.email?.[0] ?? '?').toUpperCase()}
          </div>
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              className="input resize-none w-full text-sm"
              placeholder="Share a thought or reflection…"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={submitting || !text.trim()}
                className="btn-primary text-xs py-1.5 px-4 disabled:opacity-50"
              >
                {submitting ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p className="text-sm text-lm-muted dark:text-[#BFAEA3] mb-6">
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="text-lm-accent dark:text-ember underline"
          >
            Sign in
          </button>{' '}
          to leave a comment.
        </p>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-24 rounded" />
                <div className="skeleton h-4 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-lm-muted dark:text-[#BFAEA3]">
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => {
            const isOwner =
              session?.user?.id === comment.userId || session?.user?.role === 'ADMIN'
            return (
              <div key={comment.id} className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <UserAvatar src={comment.user.image} name={comment.user.name} size={32} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-lm-text dark:text-[#FFF4E8]">
                      {comment.user.name ?? 'Community Member'}
                    </span>
                    <span className="text-xs text-lm-muted dark:text-[#BFAEA3]">
                      {timeAgo(comment.createdAt)}
                    </span>
                  </div>
                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={2}
                        className="input resize-none w-full text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(comment.id)}
                          className="text-xs btn-primary py-1 px-3"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-xs btn-outline py-1 px-3"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-lm-text dark:text-[#FFF4E8]/90 leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </p>
                      {isOwner && (
                        <div className="flex gap-3 mt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(comment.id)
                              setEditText(comment.content)
                            }}
                            className="text-xs text-lm-muted dark:text-[#BFAEA3] hover:text-lm-accent dark:hover:text-ember transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(comment.id)}
                            disabled={deletingId === comment.id}
                            className="text-xs text-lm-muted dark:text-[#BFAEA3] hover:text-red-500 transition-colors"
                          >
                            {deletingId === comment.id ? 'Deleting…' : 'Delete'}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
