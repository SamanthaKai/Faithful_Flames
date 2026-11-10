'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

type Props = {
  contentType: 'DEVOTION' | 'COMMENT'
  contentId: string
  /** When given, no fetch on mount (e.g. comments, which arrive with their counts). */
  initial?: { count: number; liked: boolean }
  variant?: 'button' | 'inline'
  loginHref?: string
}

export function LikeButton({ contentType, contentId, initial, variant = 'button', loginHref = '/login' }: Props) {
  const { data: session } = useSession()
  const [state, setState] = useState(initial ?? { count: 0, liked: false })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (initial) { setState(initial); return }
    fetch(`/api/likes?contentType=${contentType}&contentId=${contentId}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setState(d))
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentType, contentId, session?.user?.id, initial?.count, initial?.liked])

  const toggle = async () => {
    if (busy) return
    const prev = state
    setState({ liked: !prev.liked, count: prev.count + (prev.liked ? -1 : 1) }) // optimistic
    setBusy(true)
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType, contentId }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error ?? 'Could not update your like.')
      setState(d)
    } catch (e) {
      setState(prev)
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const label = state.liked ? 'Liked' : 'Like'
  const count = state.count > 0 ? state.count : null

  if (variant === 'inline') {
    const cls = `inline-flex items-center gap-1 ${state.liked ? 'text-ember' : 'hover:text-ember'}`
    if (!session) {
      return (
        <Link href={loginHref} className={cls} title="Sign in to like">
          <HeartIcon filled={false} /> {count ?? 'Like'}
        </Link>
      )
    }
    return (
      <button type="button" onClick={toggle} aria-pressed={state.liked} aria-label={`${label}${count ? ` (${count})` : ''}`} className={cls}>
        <HeartIcon filled={state.liked} /> {count ?? 'Like'}
      </button>
    )
  }

  if (!session) {
    return (
      <Link href={loginHref} className="btn-ghost !py-2 text-xs" title="Sign in to like this">
        <HeartIcon filled={false} /> Like{count && <span>· {count}</span>}
      </Link>
    )
  }
  return (
    <button type="button" onClick={toggle} aria-pressed={state.liked} className={`btn-ghost !py-2 text-xs ${state.liked ? '!border-ember !text-ember' : ''}`}>
      <HeartIcon filled={state.liked} /> {label}{count && <span>· {count}</span>}
    </button>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinejoin="round" d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.6 3.9 4 7.4 4c2 0 3.5 1.1 4.6 2.7C13.1 5.1 14.6 4 16.6 4c3.5 0 5.8 3.6 4.6 7.1-1.7 4.8-9.2 9.4-9.2 9.4Z" />
    </svg>
  )
}
