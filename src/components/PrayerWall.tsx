'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import type { PublicPrayer } from '@/lib/prayer'
import { Wick } from './Campfire'

function ago(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (d < 1) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 30) return `${d} days ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function PrayerWall({ prayers, compact = false }: { prayers: PublicPrayer[]; compact?: boolean }) {
  if (prayers.length === 0) {
    return (
      <p className="text-sm text-lm-muted dark:text-[#BFAEA3]">
        The prayer wall is quiet right now. Requests shared publicly will appear here after a moderator has reviewed them.
      </p>
    )
  }
  return (
    <ul className={compact ? 'space-y-4' : 'grid gap-5 sm:grid-cols-2'}>
      {prayers.map((p) => <PrayerCard key={p.id} p={p} compact={compact} />)}
    </ul>
  )
}

function PrayerCard({ p, compact }: { p: PublicPrayer; compact: boolean }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [state, setState] = useState({ has: p.hasPrayed, count: p.prayedCount })
  const [busy, setBusy] = useState(false)

  const pray = async () => {
    if (!session) return router.push('/login?callbackUrl=/prayer')
    if (state.has) return
    setBusy(true)
    const res = await fetch(`/api/prayer/${p.id}/pray`, { method: 'POST' })
    setBusy(false)
    if (!res.ok) return toast.error('Could not record that. Please try again.')
    const d = await res.json()
    setState({ has: true, count: d.prayedCount })
  }

  return (
    <li className={`panel relative flex flex-col p-5 ${state.has ? 'shadow-[0_0_0_1px_rgba(255,122,41,0.35),0_10px_40px_-12px_rgba(255,122,41,0.35)]' : ''}`}>
      <p className={`whitespace-pre-wrap leading-relaxed text-lm-text dark:text-[#FFF4E8]/90 ${compact ? 'line-clamp-3 text-sm' : ''}`}>{p.content}</p>
      <div className="mt-4 flex items-center justify-between gap-3 pt-1">
        <span className="text-xs text-lm-muted dark:text-[#BFAEA3]">
          {p.name ? <strong className="font-semibold text-lm-text dark:text-[#FFF4E8]">{p.name}</strong> : 'Anonymous'} · {ago(p.createdAt)}
        </span>
        <button
          type="button"
          onClick={pray}
          disabled={busy}
          aria-pressed={state.has}
          title={session ? undefined : 'Sign in to let them know you prayed'}
          className={`group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
            state.has
              ? 'border-ember/40 bg-ember/10 text-ember'
              : 'border-lm-border text-lm-muted hover:border-ember hover:text-ember dark:border-ember/20 dark:text-[#BFAEA3]'
          }`}
        >
          <Wick lit={state.has} className="h-4 w-3" />
          {state.has ? 'Prayed' : 'I prayed'}
          {state.count > 0 && <span className="tabular-nums opacity-80">· {state.count}</span>}
        </button>
      </div>
    </li>
  )
}
