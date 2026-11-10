'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const OPTIONS = [
  { value: 'BEGINNING', label: 'From the first devotion', hint: 'In order, at your own pace' },
  { value: 'LATEST', label: 'At the latest devotion', hint: 'Along with everyone' },
] as const

export function ReadingPathSetting({ path }: { path: 'BEGINNING' | 'LATEST' | null }) {
  const router = useRouter()
  const [current, setCurrent] = useState(path)
  const [busy, setBusy] = useState(false)

  const save = async (value: 'BEGINNING' | 'LATEST') => {
    if (value === current) return
    setBusy(true)
    const res = await fetch('/api/journey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: value }),
    }).catch(() => null)
    setBusy(false)
    if (!res?.ok) return toast.error('Could not save your choice.')
    setCurrent(value)
    toast.success('Saved')
    router.refresh()
  }

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Where you read from">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={current === o.value}
          disabled={busy}
          onClick={() => save(o.value)}
          className={`rounded-xl border p-4 text-left transition ${current === o.value ? 'border-ember bg-lm-highlight/40 dark:bg-ember/[0.06]' : 'border-lm-border hover:border-ember dark:border-ember/15'}`}
        >
          <span className="block font-semibold text-lm-text dark:text-[#FFF4E8]">{o.label}</span>
          <span className="mt-0.5 block text-xs text-lm-muted dark:text-[#BFAEA3]">{o.hint}</span>
        </button>
      ))}
    </div>
  )
}
