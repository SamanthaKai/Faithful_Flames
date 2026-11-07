'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

export function BookmarkButton({ contentType, contentId }: { contentType: 'DEVOTION' | 'ARTICLE'; contentId: string }) {
  const { data: session, status } = useSession()
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!session) return
    fetch(`/api/bookmarks?contentType=${contentType}&contentId=${contentId}`)
      .then((r) => r.json())
      .then((d) => setSaved(!!d.bookmarked))
      .catch(() => {})
  }, [session, contentType, contentId])

  if (status === 'loading') return <span className="inline-block h-9 w-28" />

  if (!session) {
    return (
      <Link href="/login" className="btn-ghost !py-2 text-xs" title="Sign in to save this">
        <BookmarkIcon filled={false} /> Save
      </Link>
    )
  }

  const toggle = async () => {
    setBusy(true)
    const res = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType, contentId }),
    })
    setBusy(false)
    if (!res.ok) return toast.error('Could not update your bookmark.')
    const d = await res.json()
    setSaved(d.bookmarked)
    toast.success(d.bookmarked ? 'Saved to your bookmarks' : 'Removed from bookmarks')
  }

  return (
    <button type="button" onClick={toggle} disabled={busy} aria-pressed={saved} className={`btn-ghost !py-2 text-xs ${saved ? '!border-ember !text-ember' : ''}`}>
      <BookmarkIcon filled={saved} /> {saved ? 'Saved' : 'Save'}
    </button>
  )
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinejoin="round" d="M6 3.5h12a.5.5 0 0 1 .5.5v16.2a.3.3 0 0 1-.48.24L12 16l-6.02 4.44a.3.3 0 0 1-.48-.24V4a.5.5 0 0 1 .5-.5Z" />
    </svg>
  )
}
