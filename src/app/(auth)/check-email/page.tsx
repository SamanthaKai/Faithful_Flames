'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { Logo } from '@/components/Logo'

function CheckEmailContent() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [resending, setResending] = useState(false)
  const [sent, setSent] = useState(false)

  const resend = async () => {
    if (!email) { toast.error('Please enter your email address.'); return }
    setResending(true)
    const res = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setResending(false)
    if (res.ok) {
      setSent(true)
      toast.success('Verification email sent!')
    } else {
      const body = await res.json().catch(() => ({}))
      toast.error((body as { error?: string }).error ?? 'Failed to resend. Please try again.')
    }
  }

  const prefilled = !!searchParams.get('email')

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size={48} showText={false} />
          </div>
        </div>

        <div className="card p-8 text-center">
          <div className="text-5xl mb-5">✉️</div>
          <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-cream mb-3">
            Check your inbox
          </h1>

          {prefilled ? (
            <p className="text-warm-gray text-sm leading-relaxed mb-2">
              We sent a verification link to{' '}
              <span className="font-semibold text-charcoal dark:text-cream">{email}</span>.
            </p>
          ) : (
            <p className="text-warm-gray text-sm leading-relaxed mb-2">
              Enter your email to receive a new verification link.
            </p>
          )}

          <p className="text-warm-gray text-xs mb-6">
            The link expires in 24&nbsp;hours. Check your spam folder if you don&apos;t see it.
          </p>

          {!prefilled && (
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setSent(false) }}
              className="input mb-4 text-center"
              placeholder="you@example.com"
            />
          )}

          {sent ? (
            <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-400">
              Sent! Check your inbox — and spam just in case.
            </div>
          ) : (
            <button
              type="button"
              onClick={resend}
              disabled={resending || !email}
              className="btn-outline w-full mb-4"
            >
              {resending ? 'Sending…' : prefilled ? 'Resend verification email' : 'Send verification email'}
            </button>
          )}

          <p className="text-sm text-warm-gray">
            Already verified?{' '}
            <Link href="/login" className="text-primary font-semibold hover:text-secondary">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CheckEmailPage() {
  return (
    <Suspense>
      <CheckEmailContent />
    </Suspense>
  )
}
