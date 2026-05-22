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

  const dailyVerse = verses.find((v) => v.isDaily)
  const restVerses = verses.filter((v) => !v.isDaily)

  return (
    <div className="min-h-screen bg-cream dark:bg-[#0D0A0A]">

      {/* ── Page Hero ─────────────────────────────────────────── */}
      <div className="page-hero text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-lm-accent dark:text-ember mb-4">
            ✦ Scripture ✦
          </span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-lm-text dark:text-[#FFF4E8] mb-4">
            Daily Verses
          </h1>
          <p className="text-lm-muted dark:text-[#BFAEA3] text-lg leading-relaxed">
            Scripture to anchor your soul. Meditate, reflect, and carry these words with you.
          </p>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-lm-accent dark:bg-ember text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity"
            >
              + Add Verse
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">

        {/* Admin form */}
        {showForm && isAdmin && (
          <div className="card p-6 animate-slide-up">
            <h2 className="font-heading text-xl font-bold text-lm-text dark:text-[#FFF4E8] mb-5">New Verse</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input value={form.reference} onChange={(e) => setForm((p) => ({ ...p, reference: e.target.value }))} required className="input" placeholder="Reference (e.g. Psalm 23:1)" />
              <textarea value={form.text} onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))} required rows={3} className="input resize-none" placeholder="Verse text…" />
              <textarea value={form.reflection} onChange={(e) => setForm((p) => ({ ...p, reflection: e.target.value }))} rows={3} className="input resize-none" placeholder="Reflection / commentary (optional)" />
              <input value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} className="input" placeholder="Tags, comma-separated (e.g. faith, hope)" />
              <label className="flex items-center gap-2 text-sm text-lm-text dark:text-[#FFF4E8] cursor-pointer">
                <input type="checkbox" checked={form.isDaily} onChange={(e) => setForm((p) => ({ ...p, isDaily: e.target.checked }))} className="accent-lm-accent dark:accent-ember" />
                Mark as Today&apos;s Verse
              </label>
              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Adding…' : 'Add Verse'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          /* Skeleton */
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-8 text-center space-y-4">
                <div className="skeleton h-5 w-1/3 rounded mx-auto" />
                <div className="skeleton h-8 w-4/5 rounded mx-auto" />
                <div className="skeleton h-4 w-2/3 rounded mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">

            {/* Today's featured verse — large centered hero card */}
            {dailyVerse && (
              <article className="relative card overflow-hidden">
                {/* Warm top accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-lm-accent via-amber-400 to-lm-accent dark:from-ember dark:via-gold dark:to-ember" />
                <div className="p-10 md:p-14 text-center">
                  <span className="inline-block text-xs font-semibold uppercase tracking-widest text-lm-accent dark:text-ember mb-6">
                    ✦ Today&apos;s Verse ✦
                  </span>

                  {/* Large quote mark */}
                  <div className="text-7xl font-heading leading-none text-lm-accent/15 dark:text-ember/15 select-none -mb-4">
                    &ldquo;
                  </div>

                  <blockquote className="font-heading text-2xl md:text-3xl text-lm-text dark:text-[#FFF4E8] italic leading-relaxed mb-6 dark:scripture-glow whitespace-pre-wrap">
                    {dailyVerse.text}
                  </blockquote>

                  <p className="font-semibold text-lm-accent dark:text-ember text-base tracking-wide">
                    {dailyVerse.reference}
                  </p>

                  {dailyVerse.reflection && (
                    <p className="mt-8 text-lm-muted dark:text-[#BFAEA3] text-sm leading-relaxed max-w-xl mx-auto border-t border-lm-border dark:border-ember/10 pt-6 whitespace-pre-wrap">
                      {dailyVerse.reflection}
                    </p>
                  )}

                  {dailyVerse.tags.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mt-6">
                      {dailyVerse.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
                    </div>
                  )}
                </div>
              </article>
            )}

            {/* Rest of verses — calm, spacious cards */}
            {restVerses.map((verse) => (
              <article key={verse.id} className="card p-8 md:p-10 group">
                <blockquote className="font-heading text-xl md:text-2xl text-lm-text dark:text-[#FFF4E8] italic leading-relaxed mb-5 whitespace-pre-wrap">
                  &ldquo;{verse.text}&rdquo;
                </blockquote>

                <p className="font-semibold text-lm-accent dark:text-ember mb-5 text-sm tracking-wide">
                  {verse.reference}
                </p>

                {verse.reflection && (
                  <div className="lm-border-left dark:ember-border-left pl-4 mb-5">
                    <p className="text-lm-muted dark:text-[#BFAEA3] text-sm leading-relaxed whitespace-pre-wrap">
                      {verse.reflection}
                    </p>
                  </div>
                )}

                {verse.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {verse.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
                  </div>
                )}
              </article>
            ))}

            {verses.length === 0 && (
              <div className="text-center py-20">
                <p className="text-5xl mb-5">📖</p>
                <p className="font-heading text-xl text-lm-text dark:text-[#FFF4E8] font-bold mb-2">
                  No verses yet
                </p>
                <p className="text-lm-muted dark:text-[#BFAEA3] text-sm">
                  Check back soon. Scripture is on the way.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
