'use client'

import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Logo } from '@/components/Logo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot: people never see or fill this
  const [startedAt] = useState(() => Date.now())
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, website, startedAt }),
    }).catch(() => null)
    setLoading(false)
    if (res?.ok) return setSent(true)
    const d = (await res?.json().catch(() => ({}))) as { error?: string } | undefined
    toast.error(d?.error ?? 'Something went wrong. Please try again.')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><Logo size={48} showText={false} /></div>
          <h1 className="font-heading text-3xl font-bold text-charcoal dark:text-cream">Forgot your password?</h1>
          <p className="text-warm-gray mt-2">It happens. We&rsquo;ll email you a link to choose a new one.</p>
        </div>

        <div className="card p-6 md:p-8">
          {sent ? (
            <div role="status" className="text-center">
              <p className="font-semibold text-charcoal dark:text-cream">Check your inbox</p>
              <p className="mt-2 text-sm leading-relaxed text-warm-gray">
                If <strong className="break-all">{email}</strong> has a Faithful Flames account, a reset link is on its way.
                It works once and expires in 1 hour. Please check your spam folder too.
              </p>
              <button type="button" onClick={() => setSent(false)} className="mt-5 text-sm font-semibold text-primary hover:text-secondary">
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-charcoal dark:text-cream mb-1">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" autoFocus className="input" placeholder="you@example.com" />
              </div>
              <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={website} onChange={(e) => setWebsite(e.target.value)} />
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}
          <p className="text-center text-sm text-warm-gray mt-6">
            Remembered it?{' '}
            <Link href="/login" className="text-primary font-semibold hover:text-secondary">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
