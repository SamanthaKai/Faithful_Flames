'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

export function VerificationBanner() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [resending, setResending] = useState(false)

  // /unverified already handles this clearly; no need for double banner
  if (pathname === '/unverified') return null
  if (status !== 'authenticated' || session.user.emailVerified) return null

  const handleResend = async () => {
    setResending(true)
    const res = await fetch('/api/auth/resend-verification', { method: 'POST' })
    setResending(false)
    if (res.ok) {
      toast.success('Verification email sent! Check your inbox.')
    } else {
      toast.error('Could not resend. Try again shortly.')
    }
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            <strong>Please verify your email to access community features.</strong>{' '}
            Check your inbox for a verification link.
          </span>
        </div>
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="text-xs font-semibold text-amber-700 dark:text-amber-400 underline underline-offset-2 hover:text-amber-900 disabled:opacity-50 whitespace-nowrap"
        >
          {resending ? 'Sending…' : 'Resend email'}
        </button>
      </div>
    </div>
  )
}
