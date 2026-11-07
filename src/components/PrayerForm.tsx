'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

export function PrayerForm() {
  const { data: session } = useSession()
  const [form, setForm] = useState({ name: '', content: '', isAnonymous: false, isPrivate: false, shareConsent: false, website: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState<null | 'public' | 'private'>(null)

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const res = await fetch('/api/prayer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setBusy(false)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      return setError(d.error ?? 'Something went wrong. Please try again.')
    }
    setSent(form.isPrivate || !form.shareConsent ? 'private' : 'public')
    setForm({ name: '', content: '', isAnonymous: false, isPrivate: false, shareConsent: false, website: '' })
  }

  if (sent) {
    return (
      <div className="panel p-8 text-center" role="status">
        <p className="kicker mb-3">Received</p>
        <h3 className="font-heading text-2xl font-bold text-lm-text dark:text-[#FFF4E8]">We are carrying this with you.</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-lm-muted dark:text-[#BFAEA3]">
          {sent === 'private'
            ? 'Your request is private. Only the Faithful Flames prayer team will see it.'
            : 'Once a moderator has looked at it, your request will appear on the prayer wall so others can pray too.'}
        </p>
        <button type="button" onClick={() => setSent(null)} className="btn-ghost mt-6">Share another request</button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="panel space-y-5 p-6 md:p-8">
      <div>
        <label htmlFor="pr-content" className="field-label">How can we pray for you?</label>
        <textarea
          id="pr-content"
          required
          minLength={5}
          maxLength={2000}
          rows={5}
          value={form.content}
          onChange={(e) => set('content', e.target.value)}
          className="input resize-y leading-relaxed"
          placeholder="Share as much or as little as you like. Please avoid full names, phone numbers or other private details about others."
        />
      </div>

      <div>
        <label htmlFor="pr-name" className="field-label">Your first name <span className="font-normal text-lm-muted dark:text-[#BFAEA3]">(optional)</span></label>
        <input
          id="pr-name"
          maxLength={60}
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          className="input"
          placeholder={session?.user?.name ?? 'e.g. Grace'}
        />
      </div>

      {/* Honeypot: hidden from people, tempting to bots */}
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={form.website} onChange={(e) => set('website', e.target.value)} />

      <fieldset className="space-y-3 rounded-xl border border-lm-border p-4 dark:border-ember/10">
        <legend className="px-1 text-sm font-semibold text-lm-text dark:text-[#FFF4E8]">Who may see this?</legend>
        <label className="flex gap-3 text-sm text-lm-text dark:text-[#FFF4E8]">
          <input
            type="checkbox"
            className="check"
            checked={form.isPrivate}
            onChange={(e) => setForm((f) => ({ ...f, isPrivate: e.target.checked, shareConsent: e.target.checked ? false : f.shareConsent }))}
          />
          <span>
            <strong>Keep it private.</strong>
            <span className="hint block">Only the prayer team will see it. It will never appear on the website.</span>
          </span>
        </label>
        <label className={`flex gap-3 text-sm text-lm-text dark:text-[#FFF4E8] ${form.isPrivate ? 'opacity-40' : ''}`}>
          <input type="checkbox" className="check" disabled={form.isPrivate} checked={form.shareConsent} onChange={(e) => set('shareConsent', e.target.checked)} />
          <span>
            <strong>Yes, share it on the prayer wall</strong> so others can pray.
            <span className="hint block">A moderator reviews every request before it appears.</span>
          </span>
        </label>
        <label className={`flex gap-3 text-sm text-lm-text dark:text-[#FFF4E8] ${form.isPrivate || !form.shareConsent ? 'opacity-40' : ''}`}>
          <input type="checkbox" className="check" disabled={form.isPrivate || !form.shareConsent} checked={form.isAnonymous} onChange={(e) => set('isAnonymous', e.target.checked)} />
          <span>Post it anonymously (your name is not shown)</span>
        </label>
      </fieldset>

      {error && <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">{error}</p>}

      <button type="submit" disabled={busy || form.content.trim().length < 5} className="btn-ember w-full sm:w-auto">
        {busy ? 'Sending…' : 'Send my request'}
      </button>
    </form>
  )
}
