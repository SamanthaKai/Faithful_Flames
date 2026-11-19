'use client'

import Link from 'next/link'

// Shown when a page fails to load (for example, a brief database hiccup).
// "Try again" re-renders the page without a full reload.
export default function PageError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6" role="alert">
      <p className="kicker mb-3">Something went wrong</p>
      <h1 className="font-heading text-4xl font-bold text-lm-text dark:text-warm">This page didn&rsquo;t load</h1>
      <p className="mt-4 text-lm-muted dark:text-warm-muted">
        It&rsquo;s usually a brief connection problem. Please try again in a moment.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-ember">Try again</button>
        <Link href="/" className="btn-ghost">Home</Link>
      </div>
    </div>
  )
}
