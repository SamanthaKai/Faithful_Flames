'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { loginHref } from '@/lib/safe-redirect'

// A private note on one devotion. Only its owner can read it (enforced by the API).
// It saves itself a moment after the member stops typing, when they click away,
// and when they leave the page, so a reflection is never lost.
type Initial = { signedIn: boolean; note: { content: string; updatedAt: string } | null }
type SaveState = 'idle' | 'pending' | 'saving' | 'error'

const AUTOSAVE_MS = 1200
const MAX = 10_000

export function DevotionNote({ devotionId, initial }: { devotionId: string; initial?: Initial }) {
  const { data: sessionData, status: sessionStatus } = useSession()
  const pathname = usePathname()
  const [content, setContent] = useState(initial?.note?.content ?? '')
  const [savedAt, setSavedAt] = useState<string | null>(initial?.note?.updatedAt ?? null)
  const [loading, setLoading] = useState(!initial)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  // While the browser session loads, trust what the server already knew.
  const session = sessionStatus === 'loading' && initial ? initial.signedIn : !!sessionData
  const status = sessionStatus === 'loading' && initial ? 'ready' : sessionStatus

  // Refs so the timer, unload and unmount handlers always see the latest text.
  const latest = useRef(content)
  const saved = useRef((initial?.note?.content ?? '').trim())
  const inFlight = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const url = `/api/devotions/${devotionId}/note`

  useEffect(() => {
    if (initial || !sessionData) return
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((n) => {
        if (n) {
          setContent(n.content)
          latest.current = n.content
          saved.current = n.content.trim()
          setSavedAt(n.updatedAt)
        }
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionData?.user?.id, devotionId])

  const save = useCallback(async () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null }
    const text = latest.current.trim()
    if (text === saved.current) { setSaveState('idle'); return }
    if (inFlight.current) return // the running save re-checks when it finishes
    inFlight.current = true
    setSaveState('saving')
    try {
      const res = await fetch(url, {
        method: text ? 'PUT' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: text ? JSON.stringify({ content: text }) : undefined,
      })
      if (!res.ok) throw new Error()
      const d = await res.json().catch(() => null)
      saved.current = text
      setSavedAt(text ? d?.updatedAt ?? new Date().toISOString() : null)
      setSaveState('idle')
    } catch {
      setSaveState('error')
      return
    } finally {
      inFlight.current = false
    }
    // They kept typing while that save was on its way: save the newer text too.
    if (latest.current.trim() !== saved.current) save()
  }, [url])

  const onChange = (value: string) => {
    setContent(value)
    latest.current = value
    if (timer.current) clearTimeout(timer.current)
    if (value.trim() === saved.current) { setSaveState('idle'); return }
    setSaveState('pending')
    timer.current = setTimeout(save, AUTOSAVE_MS)
  }

  // Leaving the page: warn on a full reload/close while unsaved, and on in-site
  // navigation (which unmounts this) send the last text with keepalive.
  useEffect(() => {
    const unsaved = () => latest.current.trim() !== saved.current
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!unsaved()) return
      save()
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      if (timer.current) clearTimeout(timer.current)
      if (!unsaved()) return
      const text = latest.current.trim()
      fetch(url, {
        method: text ? 'PUT' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: text ? JSON.stringify({ content: text }) : undefined,
        keepalive: true,
      }).catch(() => {})
    }
  }, [save, url])

  if (status === 'loading') return null

  if (!session) {
    return (
      <div className="panel p-6">
        <p className="kicker mb-2">Your private notes</p>
        <p className="text-sm text-lm-muted dark:text-warm-muted">
          <Link href={loginHref(pathname)} className="font-semibold text-ember underline-offset-4 hover:underline">Sign in</Link> to keep
          notes on this devotion. Only you will ever see them.
        </p>
      </div>
    )
  }

  const statusText =
    saveState === 'saving' ? 'Saving…'
    : saveState === 'pending' ? 'Typing…'
    : saveState === 'error' ? null
    : savedAt ? `Saved ${new Date(savedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}`
    : content.trim() ? '' : 'Saves automatically as you write'

  return (
    <div className="panel p-6">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="kicker">Your private notes</p>
        <span className="flex items-center gap-1.5 text-xs text-lm-muted dark:text-warm-muted">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
          Only you can see this
        </span>
      </div>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => { if (saveState === 'pending') save() }}
        disabled={loading}
        rows={5}
        maxLength={MAX}
        aria-label="Your private note on this devotion"
        aria-describedby={`note-status-${devotionId}`}
        placeholder={loading ? 'Loading…' : 'What is God saying to you through this? What will you carry into today?'}
        className="input resize-y font-body leading-relaxed"
      />
      <div className="mt-2 flex min-h-[1.5rem] items-center justify-between gap-3 text-xs text-lm-muted dark:text-warm-muted">
        <span id={`note-status-${devotionId}`} role="status" aria-live="polite">
          {saveState === 'error' ? (
            <span className="text-red-600 dark:text-red-400">
              Couldn&rsquo;t save. Check your connection.{' '}
              <button type="button" onClick={save} className="font-semibold underline underline-offset-2">Try again</button>
            </span>
          ) : statusText}
        </span>
        {content.length > MAX * 0.9 && <span>{content.length.toLocaleString()} / {MAX.toLocaleString()}</span>}
      </div>
    </div>
  )
}
