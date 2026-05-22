'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'

const MOODS = ['Grateful', 'Hopeful', 'Struggling', 'Peaceful', 'Anxious', 'Joyful', 'Doubtful', 'Overwhelmed']

interface Reflection {
  id: string
  title: string
  content: string
  mood: string | null
  createdAt: string
  updatedAt: string
  verse?: { reference: string } | null
}

export default function ReflectionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Reflection | null>(null)
  const [form, setForm] = useState({ title: '', content: '', mood: '', verseId: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/reflections')
        .then((r) => r.json())
        .then((data) => { setReflections(data); setLoading(false) })
    }
  }, [status])

  const openEdit = (r: Reflection) => {
    setEditing(r)
    setForm({ title: r.title, content: r.content, mood: r.mood ?? '', verseId: '' })
    setShowForm(true)
  }

  const closeForm = () => { setShowForm(false); setEditing(null); setForm({ title: '', content: '', mood: '', verseId: '' }) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const url = editing ? `/api/reflections/${editing.id}` : '/api/reflections'
    const method = editing ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setSubmitting(false)
    if (res.ok) {
      const data = await res.json()
      if (editing) {
        setReflections((prev) => prev.map((r) => (r.id === editing.id ? { ...r, ...data } : r)))
        toast.success('Reflection updated.')
      } else {
        setReflections((prev) => [data, ...prev])
        toast.success('Reflection saved.')
      }
      closeForm()
    } else {
      toast.error('Failed to save reflection.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reflection?')) return
    const res = await fetch(`/api/reflections/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setReflections((prev) => prev.filter((r) => r.id !== id))
      toast.success('Reflection deleted.')
    }
  }

  if (status === 'loading' || !session) return null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title text-3xl mb-1">My Reflections</h1>
          <p className="text-warm-gray text-sm">Private. Only you can see these.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary">
          + New Reflection
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-8 animate-slide-up">
          <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-4">
            {editing ? 'Edit Reflection' : 'New Reflection'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
              className="input"
              placeholder="Title"
            />
            <textarea
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              required
              rows={6}
              className="input resize-none"
              placeholder="What's on your heart?"
            />
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-cream mb-2">How are you feeling?</label>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, mood: p.mood === mood ? '' : mood }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      form.mood === mood
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white dark:bg-[#231E1E] text-warm-gray border-gray-200 dark:border-[#3A3030] hover:border-primary hover:text-primary'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Saving…' : editing ? 'Update' : 'Save'}
              </button>
              <button type="button" onClick={closeForm} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="card p-6"><div className="skeleton h-6 w-48 rounded mb-3" /><div className="skeleton h-4 w-full rounded" /></div>)}
        </div>
      ) : reflections.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-warm-gray text-lg mb-4">No reflections yet. Start writing your faith journey.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">Write your first reflection</button>
        </div>
      ) : (
        <div className="space-y-4">
          {reflections.map((r) => (
            <article key={r.id} className="card p-6 group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream">{r.title}</h2>
                    {r.mood && <span className="tag text-xs">{r.mood}</span>}
                  </div>
                  <p className="text-warm-gray text-sm line-clamp-3 leading-relaxed mb-3">{r.content}</p>
                  <p className="text-xs text-warm-gray">
                    {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    {r.updatedAt !== r.createdAt && ' · edited'}
                  </p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(r)} className="p-2 rounded-lg text-warm-gray hover:text-primary hover:bg-primary/5 transition-colors text-sm">Edit</button>
                  <button onClick={() => handleDelete(r.id)} className="p-2 rounded-lg text-warm-gray hover:text-red-500 hover:bg-red-50 transition-colors text-sm">Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
