'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { Logo } from '@/components/Logo'

const AUTH_ERRORS: Record<string, string> = {
  OAuthAccountNotLinked: 'This email is already registered with a password. Sign in with email instead.',
  Callback: 'Something went wrong during sign-in. Please try again.',
  AccessDenied: 'Access denied.',
  Verification: 'The sign-in link has expired.',
  EmailNotVerified: 'Please verify your email before signing in. Check your inbox.',
  Default: 'Sign-in failed. Please try again.',
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  const verified = searchParams.get('verified') === 'true'
  const errorMessage = errorParam ? (AUTH_ERRORS[errorParam] ?? AUTH_ERRORS.Default) : null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.error) {
      const msg = AUTH_ERRORS[res.error] ?? AUTH_ERRORS.Default
      toast.error(msg)
    } else {
      toast.success('Welcome back!')
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size={48} showText={false} />
          </div>
          <h1 className="font-heading text-3xl font-bold text-charcoal dark:text-cream">Welcome back</h1>
          <p className="text-warm-gray mt-2">Sign in to your Faithful Flames account</p>
        </div>

        <div className="card p-6 md:p-8">
          {verified && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-400">
              Email verified! You can now sign in.
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-cream mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-cream mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-warm-gray mt-6">
            New here?{' '}
            <Link href="/register" className="text-primary font-semibold hover:text-secondary">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
