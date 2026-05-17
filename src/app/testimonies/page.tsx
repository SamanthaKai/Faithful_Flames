'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Testimony {
  id: string
  content: string
  isAnonymous: boolean
  createdAt: string
  user: { name: string | null }
}

export default function TestimoniesPage() {
  const { data: session } = useSession()
  const [testimonies, setTestimonies] = useState<Testimony[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ content: '', isAnonymous: false })
  const [submitting, setSubmitting] = useState(false)

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="section-title text-4xl mb-2">Testimonies</h1>
          <p className="text-warm-gray">Real stories of God&apos;s faithfulness from our community.</p>
        </div>
        {session ? (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary whitespace-nowrap">
            Share Your Story
          </button>
        ) : (
          <Link href="/login" className="btn-primary whitespace-nowrap">Share Your Story</Link>
        )}
      </div>

      {showForm && (
        <div className="card p-6 mb-8 animate-slide-up">
          <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-4">Share Your Testimony</h2>
          <p className="text-warm-gray text-sm mb-4">Your story will be reviewed before being published. Thank you for sharing.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              required
              rows={6}
              className="input resize-none"
              placeholder="Share what God has done in your life..."
            />
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isAnonymous}
                onChange={(e) => setForm((p) => ({ ...p, isAnonymous: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-charcoal dark:text-cream">Post anonymously</span>
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
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-4 w-32 rounded mb-4" />
              <div className="skeleton h-4 w-full rounded mb-2" />
              <div className="skeleton h-4 w-3/4 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {testimonies.map((t) => (
            <article key={t.id} className="card p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {t.isAnonymous ? '?' : (t.user.name?.[0] ?? '?').toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-charcoal dark:text-cream text-sm">
                    {t.isAnonymous ? 'Anonymous' : (t.user.name ?? 'Community Member')}
                  </p>
                  <p className="text-xs text-warm-gray">
                    {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <p className="text-charcoal dark:text-cream/90 leading-relaxed">{t.content}</p>
            </article>
          ))}

          {testimonies.length === 0 && !loading && (
            <div className="text-center py-16">
              <p className="text-warm-gray text-lg mb-4">No testimonies yet — be the first to share your story!</p>
              {session && (
                <button onClick={() => setShowForm(true)} className="btn-primary">Share Your Story</button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
