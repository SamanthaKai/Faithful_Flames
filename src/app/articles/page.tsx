'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const CATEGORIES = ['Faith & Life', 'Bible Study', 'Culture', 'Prayer', 'Testimony', 'Other']

interface Article {
  id: string
  title: string
  content: string
  category: string
  publishedAt: string
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div className="text-center sm:text-left">
          <h1 className="section-title text-4xl mb-3">Articles</h1>
          <p className="text-warm-gray max-w-xl">
            Long-form writings on faith, culture, and the Christian life — written to challenge and encourage.
          </p>
        </div>
        {session ? (
          <button type="button" onClick={() => setShowForm(!showForm)} className="btn-primary whitespace-nowrap">
            + New Article
          </button>
        ) : (
          <Link href="/login" className="btn-primary whitespace-nowrap">Sign in to write</Link>
        )}
      </div>

      {showForm && (
        <div className="card p-6 mb-8 animate-slide-up">
          <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-4">New Article</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              required
              aria-label="Category"
              className="input"
            >
              <option value="">Select a category…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
              className="input"
              placeholder="Article title"
            />
            <textarea
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              required
              rows={8}
              className="input resize-none"
              placeholder="Write your article…"
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
              <div className="skeleton h-4 w-full rounded mb-1" />
              <div className="skeleton h-4 w-2/3 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {articles.map((article) => (
            <Link key={article.id} href={`/articles/${article.id}`} className="card p-6 md:p-8 block group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <span className="tag mb-3 inline-block">{article.category}</span>
                  <h2 className="font-heading text-xl md:text-2xl font-bold text-charcoal dark:text-cream group-hover:text-primary transition-colors mb-2 leading-snug">
                    {article.title}
                  </h2>
                  <p className="text-warm-gray text-sm leading-relaxed line-clamp-3 mb-4">{article.content}</p>
                  <div className="flex items-center gap-4 text-xs text-warm-gray">
                    <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span className="text-primary font-semibold">Read article →</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {articles.length === 0 && (
            <div className="text-center py-16 text-warm-gray">
              <p className="text-lg mb-4">No articles published yet.</p>
              {session && <button type="button" onClick={() => setShowForm(true)} className="btn-primary">Write the first one</button>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
