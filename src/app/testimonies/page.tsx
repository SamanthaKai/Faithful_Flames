'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Testimony {
  id: string
  userId: string
  content: string
  isAnonymous: boolean
  createdAt: string
  user: { name: string | null; id: string }
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function authorInitial(name: string | null, isAnonymous: boolean) {
  if (isAnonymous) return '?'
  return (name?.[0] ?? '?').toUpperCase()
}

export default function TestimoniesPage() {
  const { data: session } = useSession()
  const [testimonies, setTestimonies] = useState<Testimony[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ content: '', isAnonymous: false })
  const [submitting, setSubmitting] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/testimonies')
      .then((r) => r.json())
      .then((data) => { setTestimonies(data); setLoading(false) })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.content.trim()) return
    setSubmitting(true)
    const res = await fetch('/api/testimonies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSubmitting(false)
    if (res.ok) {
      toast.success('Your testimony has been submitted for review. Thank you!')
      setShowForm(false)
      setForm({ content: '', isAnonymous: false })
    } else {
      const { error } = await res.json()
      toast.error(error ?? 'Submission failed.')
    }
  }

  const handleStartEdit = (t: Testimony) => {
    setEditingId(t.id)
    setEditContent(t.content)
  }

  const handleSaveEdit = async (id: string) => {
    setSavingEdit(true)
    const res = await fetch(`/api/testimonies/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editContent }),
    })
    setSavingEdit(false)
    if (res.ok) {
      setTestimonies((prev) => prev.map((t) => t.id === id ? { ...t, content: editContent } : t))
      setEditingId(null)
      toast.success('Testimony updated.')
    } else {
      const { error } = await res.json()
      toast.error(error ?? 'Failed to update.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimony? This cannot be undone.')) return
    setDeletingId(id)
    const res = await fetch(`/api/testimonies/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    if (res.ok) {
      setTestimonies((prev) => prev.filter((t) => t.id !== id))
      toast.success('Testimony deleted.')
    } else {
      toast.error('Failed to delete.')
    }
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-[#0D0A0A]">

      {/* ── Page Hero ─────────────────────────────────────────── */}
      <div className="page-hero">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-lm-accent dark:text-ember mb-3 block">
              🔥 Stories of Faith
            </span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-lm-text dark:text-[#FFF4E8] mb-3">
              Testimonies
            </h1>
            <p className="text-lm-muted dark:text-[#BFAEA3] text-base max-w-lg leading-relaxed">
              Real stories of God&apos;s faithfulness. Every testimony is sacred — share yours and encourage someone tonight.
            </p>
          </div>
          {session ? (
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-lm-accent dark:bg-ember text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity"
            >
              Share Your Story
            </button>
          ) : (
            <Link
              href="/login"
              className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-lm-accent dark:bg-ember text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity"
            >
              Share Your Story
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Submission form */}
        {showForm && (
          <div className="card p-6 md:p-8 mb-10 animate-slide-up">
            <h2 className="font-heading text-xl font-bold text-lm-text dark:text-[#FFF4E8] mb-1">
              Share Your Testimony
            </h2>
            <p className="text-lm-muted dark:text-[#BFAEA3] text-sm mb-5">
              Your story will be reviewed before being published. We receive every testimony with gratitude.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                required
                rows={7}
                className="input resize-none"
                placeholder="Share what God has done in your life…"
              />
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isAnonymous}
                  onChange={(e) => setForm((p) => ({ ...p, isAnonymous: e.target.checked }))}
                  className="w-4 h-4 rounded accent-lm-accent dark:accent-ember"
                />
                <span className="text-sm text-lm-text dark:text-[#FFF4E8]">Post anonymously</span>
              </label>
              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Submitting…' : 'Submit'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="skeleton w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-28 rounded" />
                    <div className="skeleton h-3 w-20 rounded" />
                  </div>
                </div>
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-4/5 rounded" />
                <div className="skeleton h-4 w-3/5 rounded" />
              </div>
            ))}
          </div>
        ) : testimonies.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-6">🔥</p>
            <h2 className="font-heading text-2xl font-bold text-lm-text dark:text-[#FFF4E8] mb-3">
              Your testimony could encourage someone tonight
            </h2>
            <p className="text-lm-muted dark:text-[#BFAEA3] text-sm max-w-sm mx-auto leading-relaxed mb-8">
              Be the first to share what God has done in your life. Stories of faith light the way for others.
            </p>
            {session
              ? <button type="button" onClick={() => setShowForm(true)} className="btn-primary">Share Your Story</button>
              : <Link href="/login" className="btn-primary">Sign in to share</Link>
            }
          </div>
        ) : (
          <div className="space-y-6">
            {testimonies.map((t, index) => {
              const isFeatured = index === 0
              const displayName = t.isAnonymous ? 'Anonymous' : (t.user.name ?? 'Community Member')
              const isOwner = !!session && session.user.id === t.userId

              return (
                <article
                  key={t.id}
                  className={`card overflow-hidden ${isFeatured ? 'md:p-10' : 'p-6 md:p-8'}`}
                >
                  {isFeatured && (
                    <div className="h-0.5 w-full bg-gradient-to-r from-lm-accent via-amber-400 to-transparent dark:from-ember dark:via-gold dark:to-transparent mb-8" />
                  )}

                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`rounded-full bg-lm-accent/15 dark:bg-ember/15 flex items-center justify-center font-bold text-lm-accent dark:text-ember flex-shrink-0 ${isFeatured ? 'w-12 h-12 text-lg' : 'w-10 h-10 text-sm'}`}>
                      {authorInitial(t.user.name, t.isAnonymous)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <p className="font-semibold text-lm-text dark:text-[#FFF4E8] text-sm">{displayName}</p>
                        <span className="text-xs text-lm-muted dark:text-[#BFAEA3]">{timeAgo(t.createdAt)}</span>
                        {isFeatured && (
                          <span className="text-xs font-semibold text-lm-accent dark:text-ember bg-lm-accent/10 dark:bg-ember/10 px-2 py-0.5 rounded-full">
                            🔥 Latest
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`mt-5 ${isFeatured ? 'pl-16' : 'pl-14'}`}>
                    {editingId === t.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={6}
                          className="input resize-none w-full"
                          placeholder="Your testimony…"
                          aria-label="Edit testimony"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(t.id)}
                            disabled={savingEdit}
                            className="btn-primary text-sm px-4 py-2"
                          >
                            {savingEdit ? 'Saving…' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="btn-outline text-sm px-4 py-2"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {isFeatured ? (
                          <div className="text-5xl font-heading leading-none text-lm-accent/15 dark:text-ember/15 select-none -mb-2">&ldquo;</div>
                        ) : (
                          <div className="text-3xl font-heading leading-none text-lm-accent/15 dark:text-ember/15 select-none -mb-1">&ldquo;</div>
                        )}
                        <p className={`text-lm-text dark:text-[#FFF4E8] leading-relaxed whitespace-pre-wrap ${isFeatured ? 'text-lg md:text-xl font-heading italic' : 'text-base'}`}>
                          {t.content}
                        </p>
                        {isOwner && (
                          <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-[#3A3030]">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(t)}
                              className="text-xs text-lm-muted dark:text-[#BFAEA3] hover:text-lm-accent dark:hover:text-ember transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(t.id)}
                              disabled={deletingId === t.id}
                              className="text-xs text-lm-muted dark:text-[#BFAEA3] hover:text-red-500 transition-colors disabled:opacity-50"
                            >
                              {deletingId === t.id ? 'Deleting…' : 'Delete'}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
