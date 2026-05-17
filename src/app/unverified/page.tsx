'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import toast from 'react-hot-toast'
import { Logo } from '@/components/Logo'

export default function UnverifiedPage() {
  const [resending, setResending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleResend = async () => {
    setResending(true)
    try {
      const res = await fetch('/api/auth/resend-verification', { method: 'POST' })
      if (res.ok) {
        setSent(true)
        toast.success('Verification email sent! Check your inbox.')
      } else {
        const { error } = await res.json()
        toast.error(error ?? 'Could not send email. Try again.')
      }
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <Logo size={48} showText={false} />
        </div>

        <div className="card p-8">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>

          <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-cream mb-3">
            Your email isn&apos;t verified yet
          </h1>
          <p className="text-warm-gray leading-relaxed mb-6">
            Check your inbox and click the link we sent you to unlock the full community experience.
          </p>

          {sent ? (
            <div className="px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-400 mb-6">
              Email sent! Give it a minute and check your spam folder too.
            </div>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="btn-primary w-full mb-4"
            >
              {resending ? 'Sending…' : 'Resend verification email'}
            </button>
          )}

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-sm text-warm-gray hover:text-primary transition-colors"
          >
            Sign out
          </button>
        </div>

        <p className="mt-6 text-xs text-warm-gray">
          Already verified?{' '}
          <a href="/" className="text-primary font-semibold hover:text-secondary">
            Go to homepage
          </a>{' '}
          and sign in again to refresh your session.
        </p>
      </div>
    </div>
  )
}
