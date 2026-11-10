'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

type JourneyInfo = {
  path: 'BEGINNING' | 'LATEST' | null
  total: number
  first: { id: string } | null
  earliest: { id: string; title: string; scripture: string; number: number }[]
}

const SKIP_ON = ['/admin', '/login', '/register', '/check-email', '/verify-email', '/unverified']
const DISMISS_KEY = 'ff-journey-later'

// Shown once to a member who hasn't chosen a reading path yet: start from the
// first devotion (own pace), or join at the latest. Choosing "latest" is followed
// by a gentle recommendation to read some of the early devotions too.
export function JourneyWelcome() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [info, setInfo] = useState<JourneyInfo | null>(null)
  const [step, setStep] = useState<'choose' | 'recommend' | null>(null)
  const [busy, setBusy] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const skipPage = SKIP_ON.some((p) => pathname?.startsWith(p))

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id || session.user.role === 'ADMIN' || skipPage) return
    try { if (sessionStorage.getItem(DISMISS_KEY)) return } catch {}
    let cancelled = false
    fetch('/api/journey', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: JourneyInfo | null) => {
        if (cancelled || !d || d.path || d.total < 1) return
        setInfo(d)
        setStep('choose')
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [status, session?.user?.id, session?.user?.role, skipPage])

  useEffect(() => {
    if (!step) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.querySelector<HTMLElement>('button, a')?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  if (!step || !info) return null

  const close = () => {
    if (step === 'choose') { try { sessionStorage.setItem(DISMISS_KEY, '1') } catch {} } // ask again next visit
    setStep(null)
  }

  const choose = async (path: 'BEGINNING' | 'LATEST') => {
    setBusy(true)
    const res = await fetch('/api/journey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    }).catch(() => null)
    setBusy(false)
    if (!res?.ok) return toast.error('Could not save your choice. Please try again.')
    if (path === 'BEGINNING') {
      setStep(null)
      if (info.first) router.push(`/devotions/${info.first.id}`)
    } else {
      setStep('recommend')
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 animate-fade-in" role="presentation">
      <div className="absolute inset-0 bg-[#0D0A0A]/60 backdrop-blur-sm" onClick={close} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="journey-title"
        className="relative max-h-[90svh] w-full max-w-lg overflow-y-auto rounded-2xl border border-lm-border bg-lm-card shadow-2xl animate-slide-up dark:border-ember/15 dark:bg-[#161111]"
      >
        <div className="h-1 w-full bg-gradient-to-r from-ember-deep via-ember to-gold" />
        {step === 'choose' ? (
          <div className="p-6 sm:p-8">
            <p className="kicker mb-2">Welcome to the fire</p>
            <h2 id="journey-title" className="font-heading text-2xl font-bold text-lm-text dark:text-[#FFF4E8]">Where would you like to begin?</h2>
            <p className="mt-2 text-sm leading-relaxed text-lm-muted dark:text-[#BFAEA3]">
              {info.total === 1 ? 'The first devotion is already here.' : `There are already ${info.total} devotions here.`}{' '}
              You can change this choice any time from your bookmarks &amp; notes page.
            </p>
            <div className="mt-6 grid gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => choose('BEGINNING')}
                className="group rounded-xl border border-lm-border p-4 text-left transition hover:border-ember dark:border-ember/15 dark:hover:border-ember"
              >
                <span className="block font-heading text-lg font-bold text-lm-text group-hover:text-ember dark:text-[#FFF4E8]">Start from the first devotion</span>
                <span className="mt-1 block text-sm text-lm-muted dark:text-[#BFAEA3]">Read them in order, at your own pace. We&rsquo;ll keep your place for you.</span>
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => choose('LATEST')}
                className="group rounded-xl border border-lm-border p-4 text-left transition hover:border-ember dark:border-ember/15 dark:hover:border-ember"
              >
                <span className="block font-heading text-lg font-bold text-lm-text group-hover:text-ember dark:text-[#FFF4E8]">Join at the latest devotion</span>
                <span className="mt-1 block text-sm text-lm-muted dark:text-[#BFAEA3]">Read along with everyone from today.</span>
              </button>
            </div>
            <div className="mt-5 text-right">
              <button type="button" onClick={close} className="text-xs font-semibold text-lm-muted hover:text-ember dark:text-[#BFAEA3]">Decide later</button>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <p className="kicker mb-2">A gentle recommendation</p>
            <h2 id="journey-title" className="font-heading text-2xl font-bold text-lm-text dark:text-[#FFF4E8]">Glance back at where it began</h2>
            <p className="mt-2 text-sm leading-relaxed text-lm-muted dark:text-[#BFAEA3]">
              You don&rsquo;t need to read them all, but we&rsquo;d encourage you to skim through some of the first devotions.
              They lay the foundation for what we&rsquo;re learning together.
            </p>
            <ol className="mt-5 divide-y divide-lm-border border-y border-lm-border dark:divide-ember/10 dark:border-ember/10">
              {info.earliest.map((d) => (
                <li key={d.id}>
                  <Link href={`/devotions/${d.id}`} onClick={() => setStep(null)} className="group flex items-baseline gap-3 py-3">
                    <span className="w-6 shrink-0 font-heading text-sm italic text-ember">{d.number}</span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-lm-text group-hover:text-ember dark:text-[#FFF4E8]">{d.title}</span>
                      <span className="block text-xs text-lm-muted dark:text-[#BFAEA3]">{d.scripture}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Link href="/devotions/archive" onClick={() => setStep(null)} className="btn-ghost">All past devotions</Link>
              <Link href="/devotions" onClick={() => setStep(null)} className="btn-ember !py-2.5">Go to the latest devotion</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
