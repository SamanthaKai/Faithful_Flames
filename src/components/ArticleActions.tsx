'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const CATEGORIES = ['Faith & Life', 'Bible Study', 'Culture', 'Prayer', 'Testimony', 'Other']

interface Props {
  article: { id: string; title: string; content: string; category: string }
}

export function ArticleActions({ article }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title: article.title, content: article.content, category: article.category })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch(`/api/articles/${article.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      toast.success('Article updated.')
      setEditing(false)
      router.refresh()
    } else {
      toast.error('Failed to update article.')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this article? This cannot be undone.')) return
    setDeleting(true)
    const res = await fetch(`/api/articles/${article.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Article deleted.')
      router.push('/articles')
    } else {
      setDeleting(false)
      toast.error('Failed to delete article.')
    }
  }

  if (editing) {
    return (
      <div className="card p-6 md:p-8 mt-10 animate-slide-up">
        <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-5">Edit Article</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <select
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            required
            aria-label="Category"
            className="input"
          >
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
            rows={14}
            className="input resize-none font-mono text-sm"
            placeholder="Write your article… Use ## for headings, ### for subheadings"
          />
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="btn-outline">
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="flex gap-3 mt-6">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-lm-border dark:border-ember/20 text-lm-muted dark:text-[#BFAEA3] hover:border-lm-accent dark:hover:border-ember hover:text-lm-accent dark:hover:text-ember transition-colors"
      >
        Edit article
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-red-200 dark:border-red-500/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
      >
        {deleting ? 'Deleting…' : 'Delete'}
      </button>
    </div>
  )
}
