'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Logo } from './Logo'
import { useTheme } from './ThemeProvider'

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/devotions', label: 'Daily Devotion' },
  { href: '/prayer', label: 'Prayer' },
  { href: '/testimonies', label: 'Testimonies' },
]

function ThemeIcon({ dark }: { dark: boolean }) {
  return dark ? (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36-6.36-.71.71M6.34 17.66l-.71.71m12.02 0-.71-.71M6.34 6.34l-.71-.71M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" />
    </svg>
  ) : (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.35 15.35A9 9 0 0 1 8.65 3.65 9 9 0 1 0 20.35 15.35Z" />
    </svg>
  )
}

export function Navbar() {
  const { data: session } = useSession()
  const { theme, toggle } = useTheme()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    setOpen(false)
    setMenu(false)
  }, [pathname])

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/'))
  const initial = (session?.user?.name?.[0] ?? session?.user?.email?.[0] ?? '·').toUpperCase()

  return (
    <header className="sticky top-0 z-50 border-b border-lm-border/80 bg-cream/90 backdrop-blur-md dark:border-ember/10 dark:bg-[#0D0A0A]/90">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6" aria-label="Main">
        <Logo size={30} />

        <ul className="hidden items-center gap-1 md:flex">
          {NAV.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={isActive(l.href) ? 'page' : undefined}
                className={`relative rounded-full px-4 py-2 text-sm font-medium ${
                  isActive(l.href)
                    ? 'text-lm-text dark:text-[#FFF4E8]'
                    : 'text-lm-muted hover:text-lm-text dark:text-[#BFAEA3] dark:hover:text-[#FFF4E8]'
                }`}
              >
                {l.label}
                {isActive(l.href) && (
                  <span className="absolute inset-x-4 -bottom-[1px] h-[2px] rounded-full bg-ember shadow-[0_0_10px_rgba(255,122,41,0.8)]" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-full p-2 text-lm-muted hover:bg-lm-highlight/60 hover:text-lm-text dark:text-[#BFAEA3] dark:hover:bg-white/5 dark:hover:text-[#FFF4E8]"
          >
            <ThemeIcon dark={theme === 'dark'} />
          </button>

          {session ? (
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setMenu((v) => !v)}
                aria-expanded={menu}
                aria-label="Your account"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-ember text-sm font-bold text-white ring-2 ring-ember/20 focus:outline-none focus-visible:ring-ember"
              >
                {initial}
              </button>
              {menu && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-lm-border bg-lm-card shadow-xl animate-fade-in dark:border-ember/15 dark:bg-[#161111]">
                  <div className="border-b border-lm-border px-4 py-3 dark:border-ember/10">
                    <p className="truncate text-sm font-semibold text-lm-text dark:text-[#FFF4E8]">{session.user.name ?? 'Friend'}</p>
                    <p className="truncate text-xs text-lm-muted dark:text-[#BFAEA3]">{session.user.email}</p>
                  </div>
                  <Link href="/profile" className="block px-4 py-2.5 text-sm text-lm-text hover:bg-lm-highlight/60 dark:text-[#FFF4E8] dark:hover:bg-white/5">
                    My bookmarks &amp; notes
                  </Link>
                  {session.user.role === 'ADMIN' && (
                    <Link href="/admin" className="block px-4 py-2.5 text-sm font-semibold text-ember hover:bg-lm-highlight/60 dark:hover:bg-white/5">
                      Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="block w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-lm-text hover:text-ember dark:text-[#FFF4E8] md:inline-flex">
              Sign in
            </Link>
          )}

          <button
            type="button"
            className="rounded-full p-2 text-lm-text dark:text-[#FFF4E8] md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
              {open ? <path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" /> : <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h10" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-lm-border bg-cream animate-fade-in dark:border-ember/10 dark:bg-[#0D0A0A] md:hidden">
          <ul className="mx-auto max-w-6xl space-y-1 px-4 py-4">
            {NAV.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 font-heading text-lg ${
                    isActive(l.href) ? 'bg-lm-highlight/60 text-lm-text dark:bg-white/5 dark:text-[#FFF4E8]' : 'text-lm-muted dark:text-[#BFAEA3]'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isActive(l.href) ? 'bg-ember' : 'bg-transparent'}`} />
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="mt-3 flex gap-2 border-t border-lm-border pt-4 dark:border-ember/10">
              {session ? (
                <>
                  <Link href="/profile" className="btn-ghost flex-1">My bookmarks &amp; notes</Link>
                  {session.user.role === 'ADMIN' && <Link href="/admin" className="btn-ghost">Admin</Link>}
                  <button type="button" onClick={() => signOut({ callbackUrl: '/' })} className="btn-ghost">Sign out</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-ghost flex-1">Sign in</Link>
                  <Link href="/register" className="btn-ember flex-1">Join</Link>
                </>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
