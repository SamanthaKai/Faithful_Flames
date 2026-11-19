import Link from 'next/link'
import { Campfire } from '@/components/Campfire'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <Campfire lit={false} className="mb-6 h-28 w-auto" />
      <p className="kicker mb-3">Page not found</p>
      <h1 className="font-heading text-4xl font-bold text-lm-text dark:text-warm">We couldn&rsquo;t find that page</h1>
      <p className="mt-4 text-lm-muted dark:text-warm-muted">
        The link may be old, or the page may have moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/devotions" className="btn-ember">Today&rsquo;s devotion</Link>
        <Link href="/" className="btn-ghost">Home</Link>
      </div>
    </div>
  )
}
