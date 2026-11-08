'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

export function TestimonyForm() {
  const { data: session } = useSession()
  const empty = { title: '', content: '', displayName: '', isAnonymous: false, website: '' }
  const [form, setForm] = useState(empty)
  const [startedAt] = useState(() => Date.now())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const res = await fetch('/api/testimonies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, startedAt }),
    })
    setBusy(false)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      return setError(d.error ?? 'Something went wrong. Please try again.')
    }
    setSent(true)
    setForm(empty)
  }

  if (sent) {
    return (
      <div className="panel p-8 text-center" role="status">
        <p className="kicker mb-3">Thank you</p>
        <h3 className="font-heading text-2xl font-bold text-lm-text dark:text-[#FFF4E8]">Your story has reached the fire.</h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-lm-muted dark:text-[#BFAEA3]">
          A moderator will read it. Once it is approved, it will appear here to encourage others.
        </p>
        <button type="button" onClick={() => setSent(false)} className="btn-ghost mt-6">Share another</button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="panel space-y-5 p-6 md:p-8">
      <div>
        <label htmlFor="t-title" className="field-label">Title</label>
        <input id="t-title" required minLength={3} maxLength={120} value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="input" placeholder="e.g. He made a way when exams broke me" />
      </div>
      <div>
        <label htmlFor="t-content" className="field-label">Your testimony</label>
        <textarea id="t-content" required minLength={20} maxLength={6000} rows={8} value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="input resize-y leading-relaxed" placeholder="What did God do? Where were you before, and what changed?" />
        <p className="hint mt-1.5">{form.content.length.toLocaleString()} / 6,000</p>
      </div>
      <div>
        <label htmlFor="t-name" className="field-label">Name to show <span className="font-normal text-lm-muted dark:text-[#BFAEA3]">(optional)</span></label>
        <input id="t-name" maxLength={60} value={form.displayName} disabled={form.isAnonymous}
          onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          className="input disabled:opacity-50" placeholder={session?.user?.name ?? 'e.g. Daniel, 19'} />
      </div>
      <label className="flex gap-3 text-sm text-lm-text dark:text-[#FFF4E8]">
        <input type="checkbox" className="check" checked={form.isAnonymous} onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })} />
        <span>Share anonymously <span className="hint block">No name will be shown with your testimony.</span></span>
      </label>
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
      {error && <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">{error}</p>}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={busy} className="btn-ember">{busy ? 'Sending…' : 'Submit for review'}</button>
        <span className="hint">Every testimony is read by a moderator before it is published.</span>
      </div>
    </form>
  )
}
