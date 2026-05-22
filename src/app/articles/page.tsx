'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'

const CATEGORIES = ['Faith & Life', 'Bible Study', 'Culture', 'Prayer', 'Testimony', 'Other']

interface Article {
  id: string
  title: string
  content: string
  category: string
  publishedAt: string
}

function readingTime(text: string) {
  return `${Math.max(1, Math.round(text.trim().split(/\s+/).length / 200))} min read`
}

function timeAgo(date: string) {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

/* Category visual identity */
const CAT_META: Record<string, { icon: string; light: string; dark: string; overlay: string }> = {
  'Faith & Life': { icon: '✝',  light: 'bg-orange-50 text-orange-700 border-orange-200',   dark: 'bg-ember/10 text-ember border-ember/25',       overlay: 'from-orange-900/70 via-orange-900/40 to-transparent' },
  'Bible Study':  { icon: '📖', light: 'bg-blue-50 text-blue-700 border-blue-200',          dark: 'bg-blue-400/10 text-blue-300 border-blue-400/25', overlay: 'from-blue-900/70 via-blue-900/40 to-transparent' },
  'Culture':      { icon: '🌍', light: 'bg-green-50 text-green-700 border-green-200',        dark: 'bg-green-400/10 text-green-300 border-green-400/25', overlay: 'from-green-900/70 via-green-900/40 to-transparent' },
  'Prayer':       { icon: '🙏', light: 'bg-amber-50 text-amber-700 border-amber-200',        dark: 'bg-gold/10 text-gold border-gold/25',           overlay: 'from-amber-900/70 via-amber-900/40 to-transparent' },
  'Testimony':    { icon: '🔥', light: 'bg-red-50 text-red-700 border-red-200',              dark: 'bg-ember/10 text-ember border-ember/25',         overlay: 'from-red-900/70 via-red-900/40 to-transparent' },
  'Other':        { icon: '✨', light: 'bg-stone-50 text-stone-700 border-stone-200',        dark: 'bg-[#BFAEA3]/10 text-[#BFAEA3] border-[#BFAEA3]/25', overlay: 'from-stone-900/70 via-stone-900/40 to-transparent' },
}

function catMeta(category: string) {
  return CAT_META[category] ?? CAT_META['Other']
}

function CategoryPill({ category, size = 'sm' }: { category: string; size?: 'sm' | 'xs' }) {
  const meta = catMeta(category)
  const px = size === 'xs' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
  return (
    <span className={`inline-flex items-center gap-1 ${px} rounded-full font-semibold border ${meta.light} dark:${meta.dark}`}>
      {meta.icon} {category}
    </span>
  )
}

export default function ArticlesPage() {
  const { data: session } = useSession()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', category: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/articles')
      .then((r) => r.json())
      .then((data) => { setArticles(data); setLoading(false) })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.category) { toast.error('Please select a category.'); return }
    setSubmitting(true)
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSubmitting(false)
    if (res.ok) {
      const article = await res.json()
      setArticles((prev) => [article, ...prev])
      toast.success('Article published!')
      setShowForm(false)
      setForm({ title: '', content: '', category: '' })
    } else {
      const { error } = await res.json()
      toast.error(error ?? 'Failed to publish article.')
    }
  }

  const featured = articles[0]
  const second    = articles[1]
  const third     = articles[2]
  const rest      = articles.slice(3)

  return (
    <div className="min-h-screen bg-cream dark:bg-[#0D0A0A]">

      {/* ── Magazine masthead ──────────────────────────────────── */}
      <div className="page-hero">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-lm-accent dark:text-ember mb-3 block">
              📰 Digital Magazine
            </span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-lm-text dark:text-[#FFF4E8] mb-3">
              Articles
            </h1>
            <p className="text-lm-muted dark:text-[#BFAEA3] text-base max-w-lg leading-relaxed">
              Long-form writings on faith, culture, and the Christian life, crafted to challenge and encourage.
            </p>
          </div>
          {session ? (
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-lm-accent dark:bg-ember text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity"
            >
              + Write Article
            </button>
          ) : (
            <Link href="/login" className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 border border-lm-accent dark:border-ember text-lm-accent dark:text-ember font-semibold rounded-xl text-sm hover:bg-lm-accent/8 dark:hover:bg-ember/8 transition-colors">
              Sign in to write
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Write form */}
        {showForm && (
          <div className="card p-6 md:p-8 mb-12 animate-slide-up">
            <h2 className="font-heading text-xl font-bold text-lm-text dark:text-[#FFF4E8] mb-5">New Article</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} required aria-label="Category" className="input">
                <option value="">Select a category…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required className="input" placeholder="Article title" />
              <textarea value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} required rows={10} className="input resize-none" placeholder="Write your article…" />
              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Publishing…' : 'Publish'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          /* Skeleton grid */
          <div className="space-y-8">
            <div className="card overflow-hidden">
              <div className="skeleton h-72 w-full rounded-none" />
              <div className="p-8 space-y-4">
                <div className="skeleton h-5 w-24 rounded-full" />
                <div className="skeleton h-9 w-3/4 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-4/5 rounded" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="skeleton h-48 w-full rounded-none" />
                  <div className="p-6 space-y-3">
                    <div className="skeleton h-5 w-20 rounded-full" />
                    <div className="skeleton h-6 w-3/4 rounded" />
                    <div className="skeleton h-4 w-full rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : articles.length === 0 ? (
          /* Empty state */
          <div className="text-center py-24">
            <p className="text-6xl mb-6">📰</p>
            <h2 className="font-heading text-2xl font-bold text-lm-text dark:text-[#FFF4E8] mb-3">
              The magazine is warming up
            </h2>
            <p className="text-lm-muted dark:text-[#BFAEA3] text-sm max-w-sm mx-auto leading-relaxed mb-8">
              Your writing could be the first thing someone reads here. Every voice matters.
            </p>
            {session
              ? <button type="button" onClick={() => setShowForm(true)} className="btn-primary">Write the first article</button>
              : <Link href="/login" className="btn-primary">Sign in to write</Link>
            }
          </div>
        ) : (
          <div className="space-y-8">

            {/* ── FEATURED HERO ARTICLE ───────────────────────── */}
            {featured && (
              <Link href={`/articles/${featured.id}`} className="block group">
                <article className="card overflow-hidden">
                  {/* Cinematic banner using faithful.png + category overlay */}
                  <div className="relative h-72 md:h-96 overflow-hidden">
                    <Image
                      src="/faithful.png"
                      alt=""
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${catMeta(featured.category).overlay}`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Overlay content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <CategoryPill category={featured.category} />
                        <span className="text-white/70 text-xs">{readingTime(featured.content)}</span>
                        <span className="text-white/70 text-xs">{timeAgo(featured.publishedAt)}</span>
                      </div>
                      <h2 className="font-heading text-2xl md:text-4xl font-bold text-white leading-tight mb-4 max-w-2xl">
                        {featured.title}
                      </h2>
                      <span className="inline-flex items-center gap-2 text-white/80 text-sm font-semibold group-hover:text-white group-hover:gap-3 transition-all duration-200">
                        Read article <span aria-hidden="true">→</span>
                      </span>
                    </div>
                  </div>

                  {/* Preview text below image */}
                  <div className="p-6 md:p-8">
                    <p className="text-lm-muted dark:text-[#BFAEA3] leading-relaxed line-clamp-3">
                      {featured.content}
                    </p>
                  </div>
                </article>
              </Link>
            )}

            {/* ── MEDIUM CARDS ROW (articles 1–2) ──────────────── */}
            {(second || third) && (
              <div className="grid md:grid-cols-2 gap-6">
                {[second, third].filter(Boolean).map((article) => (
                  <Link key={article!.id} href={`/articles/${article!.id}`} className="block group">
                    <article className="card overflow-hidden h-full flex flex-col">
                      {/* Mini cinematic banner */}
                      <div className="relative h-48 overflow-hidden flex-shrink-0">
                        <Image
                          src="/faithful.png"
                          alt=""
                          fill
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-r ${catMeta(article!.category).overlay}`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                        <div className="absolute bottom-4 left-5">
                          <CategoryPill category={article!.category} size="xs" />
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-3 text-xs text-lm-muted dark:text-[#BFAEA3] mb-3">
                          <span>{readingTime(article!.content)}</span>
                          <span>·</span>
                          <span>{timeAgo(article!.publishedAt)}</span>
                        </div>
                        <h2 className="font-heading text-lg font-bold text-lm-text dark:text-[#FFF4E8] group-hover:text-lm-accent dark:group-hover:text-ember transition-colors leading-snug mb-3 flex-1">
                          {article!.title}
                        </h2>
                        <p className="text-lm-muted dark:text-[#BFAEA3] text-sm line-clamp-2 leading-relaxed mb-4">
                          {article!.content}
                        </p>
                        <span className="text-sm font-semibold text-lm-accent dark:text-ember group-hover:gap-2 inline-flex items-center gap-1 transition-all duration-200 mt-auto">
                          Read <span aria-hidden="true">→</span>
                        </span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}

            {/* ── SMALL QUICK-READ GRID (articles 3+) ─────────── */}
            {rest.length > 0 && (
              <>
                <div className="flex items-center gap-4 pt-2">
                  <div className="h-px flex-1 bg-lm-border dark:bg-ember/10" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-lm-muted dark:text-[#BFAEA3]">More articles</span>
                  <div className="h-px flex-1 bg-lm-border dark:bg-ember/10" />
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rest.map((article) => (
                    <Link key={article.id} href={`/articles/${article.id}`} className="block group">
                      <article className="card p-5 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                          <CategoryPill category={article.category} size="xs" />
                          <span className="text-xs text-lm-muted dark:text-[#BFAEA3]">{readingTime(article.content)}</span>
                        </div>
                        <h2 className="font-heading text-base font-bold text-lm-text dark:text-[#FFF4E8] group-hover:text-lm-accent dark:group-hover:text-ember transition-colors leading-snug mb-2 flex-1">
                          {article.title}
                        </h2>
                        <p className="text-lm-muted dark:text-[#BFAEA3] text-xs line-clamp-2 leading-relaxed mb-4">
                          {article.content}
                        </p>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-lm-border dark:border-ember/10 text-xs">
                          <span className="text-lm-muted dark:text-[#BFAEA3]">
                            {timeAgo(article.publishedAt)}
                          </span>
                          <span className="font-semibold text-lm-accent dark:text-ember">Read →</span>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
