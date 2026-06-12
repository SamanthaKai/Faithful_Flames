'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Logo } from '@/components/Logo'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const { error } = await res.json()
      toast.error(error ?? 'Registration failed.')
      setLoading(false)
      return
    }
    router.push(`/check-email?email=${encodeURIComponent(form.email)}`)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size={48} showText={false} />
          </div>
          <h1 className="font-heading text-3xl font-bold text-charcoal dark:text-cream">Join Faithful Flames</h1>
          <p className="text-warm-gray mt-2">Create your account and ignite your faith journey</p>
        </div>

        <div className="card p-6 md:p-8">
          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/', prompt: 'select_account' } as Parameters<typeof signIn>[1])}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border-2 border-gray-200 dark:border-[#3A3030] rounded-lg text-sm font-semibold text-charcoal dark:text-cream hover:border-primary transition-colors mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-[#3A3030]" /></div>
            <div className="relative flex justify-center"><span className="bg-white dark:bg-[#231E1E] px-3 text-xs text-warm-gray">or sign up with email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-cream mb-1">Name</label>
              <input name="name" type="text" value={form.name} onChange={handleChange} required className="input" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-cream mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-cream mb-1">Password</label>
              <input name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} required className="input" placeholder="Min. 8 characters" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-warm-gray mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:text-secondary">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
