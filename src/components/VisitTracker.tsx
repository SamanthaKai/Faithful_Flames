'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Basic daily-visitor analytics: a random id kept in this browser, no personal data.
export function VisitTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return
    let id: string | null = null
    try {
      id = localStorage.getItem('ff-visitor')
      if (!id) {
        id = crypto.randomUUID()
        localStorage.setItem('ff-visitor', id)
      }
    } catch {
      return
    }
    fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: id }),
      keepalive: true,
    }).catch(() => {})
  }, [pathname])

  return null
}
