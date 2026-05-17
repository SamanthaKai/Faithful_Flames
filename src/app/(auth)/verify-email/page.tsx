'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

const ERRORS: Record<string, string> = {
  expired: 'This link has expired. Please register again to get a new one.',
  invalid: 'This link is invalid or has already been used.',
  missing: 'No verification token found.',
}

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = error ? (ERRORS[error] ?? 'Verification failed. Please try again.') : null

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <Logo size={48} showText={false} />
        </div>
        <div className="card p-8">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-3">Verification failed</h1>
          <p className="text-warm-gray mb-6">{message}</p>
          <Link href="/register" className="btn-primary inline-block">Register again</Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  )
}
