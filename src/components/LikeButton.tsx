'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface LikeButtonProps {
  contentType: string
  contentId: string
}

export function LikeButton({ contentType, contentId }: LikeButtonProps) {
  const { status } = useSession()
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(0)
  const [ready, setReady] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/likes?contentType=${contentType}&contentId=${contentId}`)
      .then((r) => r.json())
      .then((data) => { setLiked(data.liked); setCount(data.count); setReady(true) })
  }, [contentType, contentId])

  const handleLike = async () => {
    if (status !== 'authenticated') { router.push('/login'); return }
    if (submitting) return
    setSubmitting(true)
    const res = await fetch('/api/likes/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType, contentId }),
    })
    setSubmitting(false)
    if (res.ok) {
      const data = await res.json()
      setLiked(data.liked)
      setCount(data.count)
    }
  }

  if (!ready) return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-lm-border dark:border-[#3A3030] text-sm text-transparent select-none">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
      0
    </div>
  )

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={submitting}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
        liked
          ? 'bg-lm-accent/10 text-lm-accent dark:bg-ember/10 dark:text-ember border-lm-accent/30 dark:border-ember/30'
          : 'bg-transparent text-lm-muted dark:text-[#BFAEA3] border-lm-border dark:border-[#3A3030] hover:border-lm-accent dark:hover:border-ember hover:text-lm-accent dark:hover:text-ember'
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <span>{count > 0 ? count : liked ? '1' : 'Like'}</span>
    </button>
  )
}
