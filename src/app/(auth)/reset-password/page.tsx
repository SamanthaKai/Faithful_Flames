'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signOut } from 'next-auth/react'
import toast from 'react-hot-toast'
import { Logo } from '@/components/Logo'

function ResetForm() {
  const router = useRouter()
  const token = useSearchParams().get('token') ?? ''
  const [valid, setValid] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) { setValid(false); return }
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setValid(!!d.valid))
      .catch(() => setValid(true)) // let the submit report any real problem
  }, [token])

  const tooShort = password.length > 0 && password.length < 8
  const mismatch = confirm.length > 0 && confirm !== password

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) return toast.error('Password must be at least 8 characters.')
    if (password !== confirm) return toast.error('The two passwords don’t match.')
    setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    }).catch(() => null)
    const d = (await res?.json().catch(() => ({}))) as { error?: string } | undefined
    setLoading(false)
    if (!res?.ok) {
      if (res?.status === 400 && /expired|used/i.test(d?.error ?? '')) setValid(false)
      return toast.error(d?.error ?? 'Something went wrong. Please try again.')
    }
    // The reset ended every session, including any in this browser.
    await signOut({ redirect: false }).catch(() => {})
    router.push('/login?reset=true')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><Logo size={48} showText={false} /></div>
          <h1 className="font-heading text-3xl font-bold text-charcoal dark:text-cream">Choose a new password</h1>
        </div>

        <div className="card p-6 md:p-8">
          {valid === null ? (
            <p className="text-center text-sm text-warm-gray" role="status">Checking your link…</p>
          ) : valid === false ? (
            <div className="text-center" role="alert">
              <p className="font-semibold text-charcoal dark:text-cream">This link has expired or was already used</p>
              <p className="mt-2 text-sm text-warm-gray">Reset links work once and last 1 hour. You can ask for a new one.</p>
              <Link href="/forgot-password" className="btn-primary mt-5 inline-flex px-6 py-2.5">Send a new link</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-charcoal dark:text-cream mb-1">New password</label>
                <input id="password" type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} maxLength={72} autoComplete="new-password" autoFocus className="input" aria-describedby="pw-hint" />
                <p id="pw-hint" className={`mt-1 text-xs ${tooShort ? 'text-red-600 dark:text-red-400' : 'text-warm-gray'}`}>At least 8 characters.</p>
              </div>
              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-charcoal dark:text-cream mb-1">Type it again</label>
                <input id="confirm" type={show ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" className="input" aria-invalid={mismatch} aria-describedby="confirm-hint" />
                <p id="confirm-hint" className="mt-1 min-h-[1rem] text-xs text-red-600 dark:text-red-400">{mismatch ? 'The passwords don’t match yet.' : ''}</p>
              </div>
              <label className="flex items-center gap-2 text-sm text-warm-gray">
                <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show passwords
              </label>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Saving…' : 'Save new password'}
              </button>
              <p className="text-center text-xs text-warm-gray">You&rsquo;ll be signed out everywhere, then you can sign in with your new password.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  )
}
