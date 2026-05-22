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

function readingTime(text: string) {
  const words = text.trim().split(/\s+/).length
  return `${Math.max(1, Math.round(words / 200))} min read`
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
    <div className="min-h-screen bg-cream dark:bg-[#0D0A0A]">

      {/* ── Page Hero ─────────────────────────────────────────── */}
      <div className="page-hero">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-lm-accent dark:text-ember mb-3 block">
              Daily Reading
            </span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-lm-text dark:text-[#FFF4E8] mb-3">
              Devotions
            </h1>
            <p className="text-lm-muted dark:text-[#BFAEA3] text-base max-w-lg leading-relaxed">
              Short, focused devotionals to start your day grounded in Scripture, prayer, and reflection.
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-lm-accent dark:bg-ember text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity"
            >
              + New Devotion
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Admin form */}
        {showForm && isAdmin && (
          <div className="card p-6 mb-10 animate-slide-up">
            <h2 className="font-heading text-xl font-bold text-lm-text dark:text-[#FFF4E8] mb-5">New Devotion</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required className="input" placeholder="Title" />
              <input value={form.scripture} onChange={(e) => setForm((p) => ({ ...p, scripture: e.target.value }))} required className="input" placeholder="Scripture reference (e.g. John 3:16)" />
              <textarea value={form.teaching} onChange={(e) => setForm((p) => ({ ...p, teaching: e.target.value }))} required rows={5} className="input resize-none" placeholder="Teaching / devotional body…" />
              <textarea value={form.prayerPoint} onChange={(e) => setForm((p) => ({ ...p, prayerPoint: e.target.value }))} required rows={3} className="input resize-none" placeholder="Prayer point…" />
              <input value={form.reflectionQuestion} onChange={(e) => setForm((p) => ({ ...p, reflectionQuestion: e.target.value }))} required className="input" placeholder="Reflection question" />
              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Publishing…' : 'Publish'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-8 space-y-4">
                <div className="flex gap-3">
                  <div className="skeleton h-5 w-20 rounded-full" />
                  <div className="skeleton h-5 w-24 rounded-full" />
                </div>
                <div className="skeleton h-7 w-3/4 rounded" />
                <div className="skeleton h-4 w-1/3 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-5/6 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">

            {/* Featured first devotion — wider editorial card */}
            {devotions[0] && (
              <Link href={`/devotions/${devotions[0].id}`} className="block group">
                <article className="card p-8 md:p-10 overflow-hidden">
                  <div className="h-0.5 w-16 bg-lm-accent dark:bg-ember mb-8 group-hover:w-24 transition-all duration-300" />
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="tag">Devotion</span>
                    <span className="text-xs text-lm-muted dark:text-[#BFAEA3]">
                      {new Date(devotions[0].publishedAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                    <span className="text-xs text-lm-muted dark:text-[#BFAEA3]">· {readingTime(devotions[0].teaching)}</span>
                  </div>
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-lm-text dark:text-[#FFF4E8] group-hover:text-lm-accent dark:group-hover:text-ember transition-colors mb-3 leading-snug">
                    {devotions[0].title}
                  </h2>
                  <p className="text-lm-accent dark:text-ember text-sm font-semibold italic mb-5">
                    {devotions[0].scripture}
                  </p>
                  <p className="text-lm-muted dark:text-[#BFAEA3] leading-relaxed line-clamp-3 mb-6">
                    {devotions[0].teaching}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-lm-accent dark:text-ember group-hover:gap-3 transition-all duration-200">
                    Continue reading <span aria-hidden="true">→</span>
                  </span>
                </article>
              </Link>
            )}

            {/* Remaining devotions — compact editorial list */}
            {devotions.length > 1 && (
              <div className="grid sm:grid-cols-2 gap-5">
                {devotions.slice(1).map((devotion) => (
                  <Link key={devotion.id} href={`/devotions/${devotion.id}`} className="block group">
                    <article className="card p-6 h-full flex flex-col">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="tag">Devotion</span>
                        <span className="text-xs text-lm-muted dark:text-[#BFAEA3]">
                          {readingTime(devotion.teaching)}
                        </span>
                      </div>
                      <h2 className="font-heading text-lg font-bold text-lm-text dark:text-[#FFF4E8] group-hover:text-lm-accent dark:group-hover:text-ember transition-colors mb-2 leading-snug flex-1">
                        {devotion.title}
                      </h2>
                      <p className="text-lm-accent dark:text-ember text-xs font-semibold italic mb-3">
                        {devotion.scripture}
                      </p>
                      <p className="text-lm-muted dark:text-[#BFAEA3] text-sm line-clamp-2 leading-relaxed mb-4">
                        {devotion.teaching}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-lm-border dark:border-ember/10">
                        <span className="text-xs text-lm-muted dark:text-[#BFAEA3]">
                          {new Date(devotion.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-xs font-semibold text-lm-accent dark:text-ember">Read →</span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}

            {devotions.length === 0 && (
              <div className="text-center py-20">
                <p className="font-heading text-xl text-lm-text dark:text-[#FFF4E8] font-bold mb-2">
                  No devotions yet
                </p>
                <p className="text-lm-muted dark:text-[#BFAEA3] text-sm">
                  Devotionals are being prepared. Check back soon.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
