'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

// Shown only to signed-in members; the link is fetched after sign-in so the
// number is never in the page for visitors or bots.
export function WhatsAppContact() {
  const { status } = useSession()
  const [href, setHref] = useState<string | null>(null)

  useEffect(() => {
    if (status !== 'authenticated') { setHref(null); return }
    let cancelled = false
    fetch('/api/contact')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancelled) setHref(d?.whatsapp ?? null) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [status])

  if (!href) return null
  return (
    <div className="mt-6">
      <p className="kicker mb-3">Reach out</p>
      <a href={href} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm">
        Message us on WhatsApp
      </a>
    </div>
  )
}
