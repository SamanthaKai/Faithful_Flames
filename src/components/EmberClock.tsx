'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Shows how long today's fire burns before the discussion closes at Kampala midnight.
// Purely informational — the closing rule itself is enforced by the API.
export function EmberClock({ closesAt, open, compact = false }: { closesAt: string; open: boolean; compact?: boolean }) {
  const router = useRouter()
  const end = new Date(closesAt).getTime()
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(t)
  }, [])

  const left = now === null ? null : Math.max(0, end - now)
  const stillOpen = open && (left === null || left > 0)

  useEffect(() => {
    if (open && left === 0) router.refresh()
  }, [open, left, router])

  if (!stillOpen) {
    return (
      <div className={`flex items-center gap-3 ${compact ? 'text-xs' : 'text-sm'} text-lm-muted dark:text-[#BFAEA3]`}>
        <span className="h-2 w-2 rounded-full bg-lm-muted/50 dark:bg-[#BFAEA3]/40" />
        <span>This fire has burned down. The conversation is kept, but it is closed now.</span>
      </div>
    )
  }

  const pct = left === null ? 100 : Math.min(100, (left / 86_400_000) * 100)
  const h = left === null ? null : Math.floor(left / 3_600_000)
  const m = left === null ? null : Math.floor((left % 3_600_000) / 60_000)

  return (
    <div className={compact ? 'text-xs' : 'text-sm'}>
      <div className="flex items-start gap-2.5">
        <span className="relative mt-[0.4em] flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ember" />
        </span>
        <p className="font-semibold text-lm-text dark:text-[#FFF4E8]">
          The fire is lit{' '}
          <span className="font-normal text-lm-muted dark:text-[#BFAEA3]">
            {h === null ? '' : `· closes in ${h}h ${m}m (midnight, Kampala time)`}
          </span>
        </p>
      </div>
      {!compact && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-lm-border/70 dark:bg-white/5" aria-hidden="true">
          <div
            className="h-full rounded-full bg-gradient-to-r from-ember-deep via-ember to-gold transition-[width] duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}
