'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export function MemberCountBadge() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/member-count')
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => {})
  }, [])

  if (count === null) return null

  return (
    <Link
      href="/forum"
      className="inline-flex items-center gap-2 mt-4 text-xs text-warm-gray hover:text-primary transition-colors group"
    >
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span>
        <span className="font-semibold text-primary group-hover:text-secondary transition-colors">
          {count.toLocaleString()}
        </span>
        {' '}{count === 1 ? 'member' : 'members'} in the community
      </span>
    </Link>
  )
}
