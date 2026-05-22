'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface PrayButtonProps {
  postId: string
  initialCount?: number
}

export function PrayButton({ postId, initialCount = 0 }: PrayButtonProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [prayed, setPrayed] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      setLoading(false)
      return
    }
    fetch(`/api/forum/posts/${postId}/pray`)
      .then((r) => r.json())
      .then((data) => {
        setPrayed(data.hasPrayed)
        setCount(data.prayerCount)
      })
      .finally(() => setLoading(false))
  }, [postId, session, status])

  const handlePray = async () => {
    if (status !== 'authenticated') {
      router.push('/login')
      return
    }
    if (prayed || submitting) return

    setSubmitting(true)
    const res = await fetch(`/api/forum/posts/${postId}/pray`, { method: 'POST' })
    setSubmitting(false)
    if (res.ok) {
      const data = await res.json()
      setPrayed(data.hasPrayed)
      setCount(data.prayerCount)
    }
  }

  if (loading && status === 'loading') return null

  return (
    <button
      onClick={handlePray}
      type="button"
      disabled={prayed || submitting}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
        prayed
          ? 'bg-gold/20 text-[#D97706] dark:text-gold border border-gold/30 dark:border-[#F6B25E]/30 shadow-[0_0_20px_rgba(246,178,94,0.25)] cursor-default'
          : 'bg-ember/10 text-ember dark:text-[#FF7A29] border border-ember/20 dark:border-[#FF7A29]/20 hover:bg-ember/20 hover:shadow-[0_0_20px_rgba(255,122,41,0.2)]'
      }`}
    >
      <span>{prayed ? '✨' : '🙏'}</span>
      <span>{prayed ? 'Praying' : submitting ? 'Joining…' : 'Join in prayer'}</span>
      {count > 0 && (
        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
          prayed
            ? 'bg-gold/25 text-[#D97706] dark:text-gold'
            : 'bg-ember/15 text-ember dark:text-[#FF7A29]'
        }`}>
          {count}
        </span>
      )}
    </button>
  )
}
