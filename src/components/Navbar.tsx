'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Logo } from './Logo'
import { useTheme } from './ThemeProvider'
import Image from 'next/image'

const navLinks = [
  { href: '/',            label: 'Home'        },
  { href: '/verses',      label: 'Verses'      },
  { href: '/devotions',   label: 'Devotions'   },
  { href: '/forum',       label: 'Community'   },
  { href: '/testimonies', label: 'Testimonies' },
  { href: '/articles',    label: 'Articles'    },
]

export function Navbar() {
  const { data: session } = useSession()
  const { theme, toggle } = useTheme()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isHome = pathname === '/'
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const initial =
    session?.user?.name?.[0]?.toUpperCase() ??
    session?.user?.email?.[0]?.toUpperCase() ??
    '?'

  const transparent = isHome && !scrolled && !session

  const getLinkClass = (href: string) => {
    const active = isActive(href)
    const base = 'text-sm font-medium transition-all duration-200 pb-0.5 relative'
    if (active) {
      return `${base} text-ember border-b-2 border-ember`
    }
    if (transparent) {
      return `${base} text-text-muted hover:text-text-warm border-b-2 border-transparent`
    }
    return `${base} text-warm-gray hover:text-ember dark:text-[#BFAEA3] dark:hover:text-ember border-b-2 border-transparent hover:border-ember/40`
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        transparent
          ? 'bg-transparent border-b border-transparent'
          : 'bg-white/95 dark:bg-[#0D0A0A]/95 backdrop-blur-md border-b border-[#E8D8C8] dark:border-ember/10'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        <Logo size={34} />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-5">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={getLinkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            className={`p-2 rounded-lg transition-colors duration-200 ${
              transparent
                ? 'text-text-muted hover:text-text-warm hover:bg-white/10'
                : 'text-warm-gray hover:text-ember dark:text-[#BFAEA3] hover:bg-ember/8'
            }`}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 110 10A5 5 0 0112 7z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {session ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ember"
              >
                {session.user.image ? (
                  <Image src={session.user.image} alt={session.user.name ?? ''} width={32} height={32} className="rounded-full ring-2 ring-ember/30" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-ember text-white flex items-center justify-center text-sm font-bold">
                    {initial}
                  </div>
                )}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#161111] rounded-xl shadow-xl border border-[#E8D8C8] dark:border-ember/15 overflow-hidden animate-fade-in">
                  <div className="px-4 py-3 border-b border-[#E8D8C8] dark:border-ember/10">
                    <p className="text-sm font-semibold text-[#3A2E2A] dark:text-[#FFF4E8] truncate">{session.user.name}</p>
                    <p className="text-xs text-[#7C6B62] dark:text-[#BFAEA3] truncate">{session.user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-[#3A2E2A] dark:text-[#FFF4E8] hover:bg-ember/8 transition-colors">Profile</Link>
                    <Link href="/reflections" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-[#3A2E2A] dark:text-[#FFF4E8] hover:bg-ember/8 transition-colors">My Reflections</Link>
                    <Link href="/journal" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-[#3A2E2A] dark:text-[#FFF4E8] hover:bg-ember/8 transition-colors">Prayer Journal</Link>
                    {session.user.role === 'ADMIN' && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-ember font-semibold hover:bg-ember/8 transition-colors">Admin Panel</Link>
                    )}
                    <button
                      type="button"
                      onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={`py-1.5 px-4 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                  transparent
                    ? 'border-white/30 text-white hover:bg-white/10'
                    : 'border-ember/40 text-ember hover:bg-ember/8 dark:text-ember'
                }`}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="py-1.5 px-4 text-xs font-semibold rounded-lg bg-ember text-white hover:bg-gold hover:text-[#0D0A0A] transition-all duration-200"
              >
                Join
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className={`md:hidden p-2 rounded-lg transition-colors ${
            transparent ? 'text-[#FFF4E8] hover:bg-white/10' : 'text-warm-gray dark:text-[#BFAEA3] hover:text-ember'
          }`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#E8D8C8] dark:border-ember/10 bg-white/98 dark:bg-[#0D0A0A]/98 backdrop-blur-md animate-fade-in">
          <div className="px-4 py-3 space-y-0.5">
            {navLinks.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'text-ember bg-ember/8 font-semibold'
                      : 'text-[#3A2E2A] dark:text-[#BFAEA3] hover:text-ember hover:bg-ember/5'
                  }`}
                >
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-ember flex-shrink-0" />}
                  {link.label}
                </Link>
              )
            })}
            <div className="pt-3 border-t border-[#E8D8C8] dark:border-ember/10 flex gap-2 mt-1">
              {session ? (
                <>
                  <Link href="/profile" onClick={() => setOpen(false)} className="border border-ember/40 text-ember py-1.5 px-4 text-xs font-semibold rounded-lg flex-1 text-center hover:bg-ember/8 transition-colors">Profile</Link>
                  <button type="button" onClick={() => signOut({ callbackUrl: '/' })} className="bg-ember text-white py-1.5 px-4 text-xs font-semibold rounded-lg flex-1 hover:bg-gold hover:text-[#0D0A0A] transition-colors">Sign out</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="border border-ember/40 text-ember py-1.5 px-4 text-xs font-semibold rounded-lg flex-1 text-center hover:bg-ember/8 transition-colors">Sign in</Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="bg-ember text-white py-1.5 px-4 text-xs font-semibold rounded-lg flex-1 text-center hover:bg-gold hover:text-[#0D0A0A] transition-colors">Join</Link>
                </>
              )}
              <button type="button" onClick={toggle} className="p-2 rounded-lg border border-[#E8D8C8] dark:border-ember/20 text-[#7C6B62] dark:text-[#BFAEA3] hover:border-ember/40 transition-colors">
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
