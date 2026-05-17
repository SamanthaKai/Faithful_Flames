'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Devotion {
  id: string
  title: string
  scripture: string
  teaching: string
  prayerPoint: string
  reflectionQuestion: string
  publishedAt: string
}

export default function DevotionsPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const [devotions, setDevotions] = useState<Devotion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', scripture: '', teaching: '', prayerPoint: '', reflectionQuestion: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/devotions')
      .then((r) => r.json())
      .then((data) => { setDevotions(data); setLoading(false) })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch('/api/devotions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSubmitting(false)
    if (res.ok) {
      const devotion = await res.json()
      setDevotions((prev) => [devotion, ...prev])
      toast.success('Devotion published!')
      setShowForm(false)
      setForm({ title: '', scripture: '', teaching: '', prayerPoint: '', reflectionQuestion: '' })
    } else {
      const { error } = await res.json()
      toast.error(error ?? 'Failed to publish devotion.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div className="text-center sm:text-left">
          <h1 className="section-title text-4xl mb-3">Devotions</h1>
          <p className="text-warm-gray max-w-xl">
            Short, focused devotionals to start your day grounded in Scripture, prayer, and reflection.
          </p>
        </div>
        {isAdmin && (
          <button type="button" onClick={() => setShowForm(!showForm)} className="btn-primary whitespace-nowrap">
            + New Devotion
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="card p-6 mb-8 animate-slide-up">
          <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-4">New Devotion</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
              className="input"
              placeholder="Title"
            />
            <input
              value={form.scripture}
              onChange={(e) => setForm((p) => ({ ...p, scripture: e.target.value }))}
              required
              className="input"
              placeholder="Scripture reference (e.g. John 3:16)"
            />
            <textarea
              value={form.teaching}
              onChange={(e) => setForm((p) => ({ ...p, teaching: e.target.value }))}
              required
              rows={5}
              className="input resize-none"
              placeholder="Teaching / devotional body…"
            />
            <textarea
              value={form.prayerPoint}
              onChange={(e) => setForm((p) => ({ ...p, prayerPoint: e.target.value }))}
              required
              rows={3}
              className="input resize-none"
              placeholder="Prayer point…"
            />
            <input
              value={form.reflectionQuestion}
              onChange={(e) => setForm((p) => ({ ...p, reflectionQuestion: e.target.value }))}
              required
              className="input"
              placeholder="Reflection question"
            />
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Publishing…' : 'Publish'}
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
              <div className="skeleton h-4 w-20 rounded mb-3" />
              <div className="skeleton h-6 w-3/4 rounded mb-2" />
              <div className="skeleton h-4 w-full rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {devotions.map((devotion) => (
            <Link key={devotion.id} href={`/devotions/${devotion.id}`} className="card p-6 md:p-8 block group">
              <div className="flex items-center gap-2 mb-3">
                <span className="tag bg-secondary/10 text-secondary">Devotion</span>
                <span className="text-xs text-warm-gray">
                  {new Date(devotion.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h2 className="font-heading text-xl md:text-2xl font-bold text-charcoal dark:text-cream group-hover:text-primary transition-colors mb-2">
                {devotion.title}
              </h2>
              <p className="text-primary text-sm font-medium mb-3 italic">{devotion.scripture}</p>
              <p className="text-warm-gray text-sm line-clamp-3 leading-relaxed">{devotion.teaching}</p>
              <span className="text-secondary text-sm font-semibold mt-4 inline-block">Read devotion →</span>
            </Link>
          ))}

          {devotions.length === 0 && (
            <div className="text-center py-16 text-warm-gray">
              <p className="text-lg">No devotions yet. Check back soon.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
