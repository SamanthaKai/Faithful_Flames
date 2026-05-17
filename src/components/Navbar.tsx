'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Logo } from './Logo'
import { useTheme } from './ThemeProvider'
import Image from 'next/image'

const navLinks = [
  { href: '/verses', label: 'Verses' },
  { href: '/articles', label: 'Articles' },
  { href: '/devotions', label: 'Devotions' },
  { href: '/testimonies', label: 'Testimonies' },
  { href: '/forum', label: 'Community' },
]

export function Navbar() {
  const { data: session } = useSession()
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const initial = session?.user?.name?.[0]?.toUpperCase() ?? session?.user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-dark-bg/95 backdrop-blur border-b border-gray-100 dark:border-[#3A3030]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        <Logo size={34} />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-warm-gray hover:text-primary dark:text-gray-300 dark:hover:text-orange-400 transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="p-2 rounded-lg text-warm-gray hover:text-primary hover:bg-primary/5 transition-colors duration-150"
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
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {session.user.image ? (
                  <Image src={session.user.image} alt={session.user.name ?? ''} width={32} height={32} className="rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                    {initial}
                  </div>
                )}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#231E1E] rounded-xl shadow-lg border border-gray-100 dark:border-[#3A3030] overflow-hidden animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-[#3A3030]">
                    <p className="text-sm font-semibold text-charcoal dark:text-cream truncate">{session.user.name}</p>
                    <p className="text-xs text-warm-gray truncate">{session.user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-charcoal dark:text-cream hover:bg-primary/5 transition-colors">Profile</Link>
                    <Link href="/reflections" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-charcoal dark:text-cream hover:bg-primary/5 transition-colors">My Reflections</Link>
                    {session.user.role === 'ADMIN' && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-primary font-semibold hover:bg-primary/5 transition-colors">Admin Panel</Link>
                    )}
                    <button
                      onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-outline py-1.5 px-4 text-xs">Sign in</Link>
              <Link href="/register" className="btn-primary py-1.5 px-4 text-xs">Join</Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-warm-gray hover:text-primary"
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
        <div className="md:hidden border-t border-gray-100 dark:border-[#3A3030] bg-white dark:bg-dark-bg animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-2 text-sm font-medium text-charcoal dark:text-cream hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 dark:border-[#3A3030] flex gap-2">
              {session ? (
                <>
                  <Link href="/profile" onClick={() => setOpen(false)} className="btn-outline py-1.5 px-4 text-xs flex-1 text-center">Profile</Link>
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="btn-primary py-1.5 px-4 text-xs flex-1">Sign out</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="btn-outline py-1.5 px-4 text-xs flex-1 text-center">Sign in</Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="btn-primary py-1.5 px-4 text-xs flex-1 text-center">Join</Link>
                </>
              )}
              <button onClick={toggle} className="p-2 rounded-lg border border-gray-200 text-warm-gray">
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
