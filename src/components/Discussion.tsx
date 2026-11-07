'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import type { Discussion as DiscussionData, PublicComment } from '@/lib/comments'
import { EmberClock } from './EmberClock'

function ago(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const h = Math.floor(mins / 60)
  if (h < 24) return `${h}h ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function send(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? 'Something went wrong.')
  return data
}

export function Discussion({ devotionId, initial }: { devotionId: string; initial: DiscussionData }) {
  const { data: session } = useSession()
  const [data, setData] = useState(initial)

  const reload = useCallback(async () => {
    const res = await fetch(`/api/comments?devotionId=${devotionId}`, { cache: 'no-store' })
    if (res.ok) setData(await res.json())
  }, [devotionId])

  const act = async (fn: () => Promise<unknown>, ok?: string) => {
    try {
      await fn()
      if (ok) toast.success(ok)
      await reload()
      return true
    } catch (e) {
      toast.error((e as Error).message)
      await reload() // e.g. the discussion just closed at midnight
      return false
    }
  }

  const canPost = data.open && !!session

  return (
    <section id="discussion" aria-labelledby="discussion-title" className="scroll-mt-24">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker mb-2">Around the fire</p>
          <h2 id="discussion-title" className="font-heading text-3xl font-bold text-lm-text dark:text-[#FFF4E8]">
            {data.open ? <>Today&rsquo;s conversation</> : 'The conversation that day'}
            {data.count > 0 && <span className="ml-3 align-middle font-body text-base font-normal text-lm-muted dark:text-[#BFAEA3]">{data.count}</span>}
          </h2>
        </div>
      </div>

      <div className="mb-8">
        <EmberClock closesAt={data.closesAt} open={data.open} />
      </div>

      {data.open && !session && (
        <p className="panel mb-8 p-5 text-sm text-lm-muted dark:text-[#BFAEA3]">
          <Link href={`/login?callbackUrl=/devotions/${devotionId}%23discussion`} className="font-semibold text-ember hover:underline">Sign in</Link>{' '}
          to add your voice. Anyone can read along.
        </p>
      )}

      {canPost && (
        <Composer
          placeholder="What stood out to you in today’s reading?"
          submitLabel="Share"
          onSubmit={(content) => act(() => send('/api/comments', 'POST', { devotionId, content }))}
        />
      )}

      {data.comments.length === 0 ? (
        <p className="py-6 text-sm text-lm-muted dark:text-[#BFAEA3]">
          {data.open ? 'No one has spoken yet. Be the first to add a log to the fire.' : 'No one joined this conversation.'}
        </p>
      ) : (
        <ol className="mt-8 space-y-7">
          {data.comments.map((c) => (
            <li key={c.id}>
              <CommentItem c={c} open={data.open} signedIn={!!session} act={act} devotionId={devotionId} />
              {c.replies.length > 0 && (
                <ol className="ml-5 mt-5 space-y-5 border-l border-lm-border pl-5 dark:border-ember/15 sm:ml-10">
                  {c.replies.map((r) => (
                    <li key={r.id}>
                      <CommentItem c={r} open={data.open} signedIn={!!session} act={act} devotionId={devotionId} replyTo={c.id} />
                    </li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

type Act = (fn: () => Promise<unknown>, ok?: string) => Promise<boolean>

function CommentItem({ c, open, signedIn, act, devotionId, replyTo }: {
  c: PublicComment; open: boolean; signedIn: boolean; act: Act; devotionId: string; replyTo?: string
}) {
  const [mode, setMode] = useState<'idle' | 'reply' | 'edit'>('idle')

  if (c.removed) {
    return <p className="text-sm italic text-lm-muted dark:text-[#BFAEA3]">This comment was removed.</p>
  }

  const report = () => {
    const reason = window.prompt('What is wrong with this comment? (optional)')
    if (reason === null) return
    act(() => send(`/api/comments/${c.id}/report`, 'POST', { reason }), 'Thank you. A moderator will take a look.')
  }

  return (
    <article>
      <header className="mb-1.5 flex flex-wrap items-baseline gap-x-2.5">
        <span className="font-semibold text-lm-text dark:text-[#FFF4E8]">{c.author.name}</span>
        <time className="text-xs text-lm-muted dark:text-[#BFAEA3]" dateTime={c.createdAt}>{ago(c.createdAt)}{c.edited && ' · edited'}</time>
        {c.hidden && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-700">Hidden</span>}
      </header>

      {mode === 'edit' ? (
        <Composer
          initial={c.content}
          submitLabel="Save"
          onCancel={() => setMode('idle')}
          onSubmit={async (content) => {
            const ok = await act(() => send(`/api/comments/${c.id}`, 'PATCH', { content }))
            if (ok) setMode('idle')
            return ok
          }}
        />
      ) : (
        <p className="whitespace-pre-wrap leading-relaxed text-lm-text dark:text-[#FFF4E8]/90">{c.content}</p>
      )}

      {mode !== 'edit' && (
        <div className="mt-2 flex flex-wrap gap-4 text-xs font-semibold text-lm-muted dark:text-[#BFAEA3]">
          {open && signedIn && (
            <button type="button" className="hover:text-ember" onClick={() => setMode(mode === 'reply' ? 'idle' : 'reply')}>Reply</button>
          )}
          {open && c.isMine && (
            <>
              <button type="button" className="hover:text-ember" onClick={() => setMode('edit')}>Edit</button>
              <button
                type="button"
                className="hover:text-red-600"
                onClick={() => confirm('Remove your comment?') && act(() => send(`/api/comments/${c.id}`, 'DELETE'), 'Comment removed')}
              >
                Delete
              </button>
            </>
          )}
          {signedIn && !c.isMine && (
            <button type="button" className="hover:text-red-600" onClick={report}>Report</button>
          )}
        </div>
      )}

      {mode === 'reply' && (
        <div className="mt-4">
          <Composer
            autoFocus
            placeholder={`Reply to ${c.author.name}…`}
            submitLabel="Reply"
            onCancel={() => setMode('idle')}
            onSubmit={async (content) => {
              const ok = await act(() => send('/api/comments', 'POST', { devotionId, content, parentId: replyTo ?? c.id }))
              if (ok) setMode('idle')
              return ok
            }}
          />
        </div>
      )}
    </article>
  )
}

function Composer({ initial = '', placeholder, submitLabel, onSubmit, onCancel, autoFocus }: {
  initial?: string; placeholder?: string; submitLabel: string; autoFocus?: boolean
  onSubmit: (content: string) => Promise<boolean>; onCancel?: () => void
}) {
  const [text, setText] = useState(initial)
  const [busy, setBusy] = useState(false)
  return (
    <form
      className="space-y-2"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!text.trim()) return
        setBusy(true)
        const ok = await onSubmit(text)
        setBusy(false)
        if (ok && !initial) setText('')
      }}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        maxLength={2000}
        autoFocus={autoFocus}
        placeholder={placeholder}
        aria-label={placeholder ?? 'Comment'}
        className="input resize-y leading-relaxed"
      />
      <div className="flex justify-end gap-2">
        {onCancel && <button type="button" onClick={onCancel} className="btn-ghost !py-2 text-xs">Cancel</button>}
        <button type="submit" disabled={busy || !text.trim()} className="btn-ember !px-5 !py-2 text-xs">{busy ? '…' : submitLabel}</button>
      </div>
    </form>
  )
}
