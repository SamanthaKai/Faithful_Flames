'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { BookOpen, CheckCircle, Plus, X, Edit2, Trash2 } from 'lucide-react'

interface JournalEntry {
  id: string
  title: string
  content: string
  status: 'BELIEVING' | 'ANSWERED'
  createdAt: string
  updatedAt: string
}

const STATUS_LABELS = {
  BELIEVING: 'Believing',
  ANSWERED: 'Answered',
}

function EntryCard({
  entry,
  onStatusToggle,
  onEdit,
  onDelete,
}: {
  entry: JournalEntry
  onStatusToggle: (id: string, current: 'BELIEVING' | 'ANSWERED') => void
  onEdit: (entry: JournalEntry) => void
  onDelete: (id: string) => void
}) {
  const isAnswered = entry.status === 'ANSWERED'

  return (
    <div className={`card p-5 transition-all ${isAnswered ? 'border-l-4 border-l-amber-400' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isAnswered && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                <CheckCircle size={11} /> Answered!
              </span>
            )}
          </div>
          <h3 className="font-heading font-semibold text-charcoal dark:text-cream text-base">{entry.title}</h3>
          <p className="text-sm text-charcoal dark:text-cream/80 mt-1 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
          <p className="text-xs text-warm-gray mt-2">
            {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => onStatusToggle(entry.id, entry.status)}
            title={isAnswered ? 'Mark as still believing' : 'Mark as answered'}
            className={`p-1.5 rounded-full transition-colors ${
              isAnswered
                ? 'text-amber-500 hover:text-amber-600'
                : 'text-warm-gray hover:text-amber-500'
            }`}
          >
            <CheckCircle size={16} />
          </button>
          <button
            type="button"
            onClick={() => onEdit(entry)}
            className="p-1.5 rounded-full text-warm-gray hover:text-primary transition-colors"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
            className="p-1.5 rounded-full text-warm-gray hover:text-red-500 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })
  const [submitting, setSubmitting] = useState(false)

  const [editing, setEditing] = useState<JournalEntry | null>(null)
  const [editForm, setEditForm] = useState({ title: '', content: '' })
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    fetch('/api/journal')
      .then((r) => r.json())
      .then((data) => { setEntries(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSubmitting(false)
    if (res.ok) {
      const entry = await res.json()
      setEntries((prev) => [entry, ...prev])
      setForm({ title: '', content: '' })
      setShowForm(false)
      toast.success('Prayer added to your journal.')
    } else {
      const { error } = await res.json()
      toast.error(error ?? 'Failed to save.')
    }
  }

  const handleStatusToggle = async (id: string, current: 'BELIEVING' | 'ANSWERED') => {
    const next = current === 'BELIEVING' ? 'ANSWERED' : 'BELIEVING'
    const res = await fetch(`/api/journal/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    if (res.ok) {
      setEntries((prev) => prev.map((e) => e.id === id ? { ...e, status: next } : e))
      if (next === 'ANSWERED') toast.success('Praise God! Marked as answered.')
    }
  }

  const handleStartEdit = (entry: JournalEntry) => {
    setEditing(entry)
    setEditForm({ title: entry.title, content: entry.content })
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setSavingEdit(true)
    const res = await fetch(`/api/journal/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    setSavingEdit(false)
    if (res.ok) {
      setEntries((prev) => prev.map((e) => e.id === editing.id ? { ...e, ...editForm } : e))
      setEditing(null)
      toast.success('Entry updated.')
    } else {
      const { error } = await res.json()
      toast.error(error ?? 'Failed to update.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this prayer journal entry?')) return
    const res = await fetch(`/api/journal/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setEntries((prev) => prev.filter((e) => e.id !== id))
      toast.success('Entry deleted.')
    } else {
      toast.error('Failed to delete.')
    }
  }

  const believing = entries.filter((e) => e.status === 'BELIEVING')
  const answered = entries.filter((e) => e.status === 'ANSWERED')

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="skeleton h-8 w-48 rounded mb-6" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded" />)}
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-charcoal dark:text-cream flex items-center gap-3">
            <BookOpen className="text-primary" size={28} />
            Prayer Journal
          </h1>
          <p className="text-warm-gray mt-1 text-sm">Private. Only you can see these.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="btn-primary flex items-center gap-2"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'New entry'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-5 mb-8 space-y-3">
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            required
            placeholder="What are you praying for?"
            aria-label="Prayer title"
            className="input w-full"
          />
          <textarea
            value={form.content}
            onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
            required
            rows={4}
            placeholder="Write your prayer here..."
            aria-label="Prayer content"
            className="input resize-none w-full"
          />
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Saving...' : 'Save to journal'}
          </button>
        </form>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-lg space-y-3">
            <h2 className="font-heading font-bold text-charcoal dark:text-cream">Edit Entry</h2>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <input
                value={editForm.title}
                onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                required
                placeholder="What are you praying for?"
                aria-label="Prayer title"
                className="input w-full"
              />
              <textarea
                value={editForm.content}
                onChange={(e) => setEditForm((p) => ({ ...p, content: e.target.value }))}
                required
                rows={5}
                placeholder="Write your prayer here..."
                aria-label="Prayer content"
                className="input resize-none w-full"
              />
              <div className="flex gap-2">
                <button type="submit" disabled={savingEdit} className="btn-primary">
                  {savingEdit ? 'Saving...' : 'Save changes'}
                </button>
                <button type="button" onClick={() => setEditing(null)} className="btn-outline">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-16 text-warm-gray">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Your prayer journal is empty.</p>
          <p className="text-sm mt-1">Start by adding a prayer request above.</p>
        </div>
      ) : (
        <>
          {believing.length > 0 && (
            <section className="mb-10">
              <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                Believing ({believing.length})
              </h2>
              <div className="space-y-3">
                {believing.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onStatusToggle={handleStatusToggle}
                    onEdit={handleStartEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}

          {answered.length > 0 && (
            <section>
              <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream mb-4 flex items-center gap-2">
                <CheckCircle size={16} className="text-amber-500" />
                Answered Prayers ({answered.length})
              </h2>
              <div className="space-y-3">
                {answered.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onStatusToggle={handleStatusToggle}
                    onEdit={handleStartEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
