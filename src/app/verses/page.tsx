'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface Verse {
  id: string
  reference: string
  text: string
  reflection: string
  tags: string[]
  isDaily: boolean
}

export default function VersesPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const [verses, setVerses] = useState<Verse[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ reference: '', text: '', reflection: '', tags: '', isDaily: false })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/verses')
      .then((r) => r.json())
      .then((data) => { setVerses(data); setLoading(false) })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch('/api/verses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      }),
    })
    setSubmitting(false)
    if (res.ok) {
      const verse = await res.json()
      setVerses((prev) => [verse, ...prev])
      toast.success('Verse added!')
      setShowForm(false)
      setForm({ reference: '', text: '', reflection: '', tags: '', isDaily: false })
    } else {
      const { error } = await res.json()
      toast.error(error ?? 'Failed to add verse.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div className="text-center sm:text-left">
          <h1 className="section-title text-4xl mb-3">Daily Verses</h1>
          <p className="text-warm-gray max-w-xl">
            Scripture to anchor your soul — meditate, reflect, and carry these words with you throughout your day.
          </p>
        </div>
        {isAdmin && (
          <button type="button" onClick={() => setShowForm(!showForm)} className="btn-primary whitespace-nowrap">
            + New Verse
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="card p-6 mb-8 animate-slide-up">
          <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-4">New Verse</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              value={form.reference}
              onChange={(e) => setForm((p) => ({ ...p, reference: e.target.value }))}
              required
              className="input"
              placeholder="Reference (e.g. Psalm 23:1)"
            />
            <textarea
              value={form.text}
              onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
              required
              rows={3}
              className="input resize-none"
              placeholder="Verse text…"
            />
            <textarea
              value={form.reflection}
              onChange={(e) => setForm((p) => ({ ...p, reflection: e.target.value }))}
              rows={3}
              className="input resize-none"
              placeholder="Reflection / commentary (optional)"
            />
            <input
              value={form.tags}
              onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
              className="input"
              placeholder="Tags, comma-separated (e.g. faith, hope, peace)"
            />
            <label className="flex items-center gap-2 text-sm text-charcoal dark:text-cream cursor-pointer">
              <input
                type="checkbox"
                checked={form.isDaily}
                onChange={(e) => setForm((p) => ({ ...p, isDaily: e.target.checked }))}
                className="accent-primary"
              />
              Mark as Today&apos;s Verse
            </label>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Adding…' : 'Add Verse'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-5 w-3/4 rounded mb-3" />
              <div className="skeleton h-4 w-1/3 rounded mb-4" />
              <div className="skeleton h-4 w-full rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {verses.map((verse) => (
            <article key={verse.id} className="card p-6 md:p-8">
              {verse.isDaily && (
                <span className="tag mb-3 inline-block">Today&apos;s Verse</span>
              )}
              <blockquote className="font-heading text-lg md:text-xl text-charcoal dark:text-cream italic leading-relaxed mb-3">
                &ldquo;{verse.text}&rdquo;
              </blockquote>
              <p className="font-semibold text-primary mb-4">— {verse.reference}</p>
              {verse.reflection && (
                <div className="border-l-2 border-primary/30 pl-4">
                  <p className="text-sm text-warm-gray leading-relaxed">{verse.reflection}</p>
                </div>
              )}
              {verse.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {verse.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </article>
          ))}

          {verses.length === 0 && (
            <div className="text-center py-16 text-warm-gray">
              <p className="text-lg">No verses yet. Check back soon.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
