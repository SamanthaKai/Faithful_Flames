'use client'

import { useState } from 'react'
import Link from 'next/link'
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
              <input name="password" type="password" value={form.password} onChange={handleChange} required className="input" placeholder="Min. 8 characters" />
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
