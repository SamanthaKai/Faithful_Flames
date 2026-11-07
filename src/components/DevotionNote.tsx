'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

// A private note on one devotion. Only its owner can read it (enforced by the API).
export function DevotionNote({ devotionId }: { devotionId: string }) {
  const { data: session, status } = useSession()
  const [content, setContent] = useState('')
  const [saved, setSaved] = useState('')
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!session) return
    fetch(`/api/devotions/${devotionId}/note`)
      .then((r) => (r.ok ? r.json() : null))
      .then((n) => {
        if (n) {
          setContent(n.content)
          setSaved(n.content)
          setSavedAt(n.updatedAt)
        }
      })
      .finally(() => setLoading(false))
  }, [session, devotionId])

  if (status === 'loading') return null

  if (!session) {
    return (
      <div className="panel p-6">
        <p className="kicker mb-2">Your private notes</p>
        <p className="text-sm text-lm-muted dark:text-[#BFAEA3]">
          <Link href="/login" className="font-semibold text-ember underline-offset-4 hover:underline">Sign in</Link> to keep
          notes on this devotion. Only you will ever see them.
        </p>
      </div>
    )
  }

  const save = async () => {
    setBusy(true)
    const res = await fetch(`/api/devotions/${devotionId}/note`, {
      method: content.trim() ? 'PUT' : 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: content.trim() ? JSON.stringify({ content }) : undefined,
    })
    setBusy(false)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      return toast.error(d.error ?? 'Could not save your note.')
    }
    const d = await res.json()
    setSaved(content.trim())
    setSavedAt(d?.updatedAt ?? null)
    toast.success(content.trim() ? 'Note saved' : 'Note removed')
  }

  const dirty = content.trim() !== saved

  return (
    <div className="panel p-6">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="kicker">Your private notes</p>
        <span className="flex items-center gap-1.5 text-xs text-lm-muted dark:text-[#BFAEA3]">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
          Only you can see this
        </span>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
        rows={5}
        maxLength={10000}
        aria-label="Your private note on this devotion"
        placeholder={loading ? 'Loading…' : 'What is God saying to you through this? What will you carry into today?'}
        className="input resize-y font-body leading-relaxed"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs text-lm-muted dark:text-[#BFAEA3]">
          {savedAt && !dirty ? `Saved ${new Date(savedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}` : dirty ? 'Unsaved changes' : ''}
        </span>
        <button type="button" onClick={save} disabled={busy || !dirty} className="btn-ghost !py-2 text-xs">
          {busy ? 'Saving…' : 'Save note'}
        </button>
      </div>
    </div>
  )
}
