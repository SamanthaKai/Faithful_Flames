import Link from 'next/link'
import { Logo } from './Logo'
import { MemberCountBadge } from './MemberCountBadge'

export function Footer() {
  return (
    <footer className="bg-white dark:bg-[#231E1E] border-t border-gray-100 dark:border-[#3A3030] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="flex flex-col">
            <Logo size={32} />
            <p className="mt-3 text-sm text-warm-gray leading-relaxed max-w-xs">
              A community for young Christians to ignite their faith, grow together, and find their people.
            </p>
            <MemberCountBadge />
          </div>

          {/* Content links */}
          <div>
            <h4 className="font-heading font-semibold text-charcoal dark:text-cream text-sm mb-4 tracking-wide">
              Content
            </h4>
            <ul className="space-y-2.5">
              {[
                ['Daily Verses', '/verses'],
                ['Articles', '/articles'],
                ['Devotions', '/devotions'],
                ['Testimonies', '/testimonies'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-warm-gray hover:text-primary dark:hover:text-orange-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community links */}
          <div>
            <h4 className="font-heading font-semibold text-charcoal dark:text-cream text-sm mb-4 tracking-wide">
              Community
            </h4>
            <ul className="space-y-2.5">
              {[
                ['Forum', '/forum'],
                ['Share Your Story', '/testimonies'],
                ['My Reflections', '/reflections'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-warm-gray hover:text-primary dark:hover:text-orange-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-[#3A3030] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-warm-gray">
            &copy; {new Date().getFullYear()} Faithful Flames. Built with love and faith.
          </p>
          <p className="text-xs text-warm-gray italic">
            &ldquo;For the fire of God is a consuming fire.&rdquo; — Hebrews 12:29
          </p>
        </div>

      </div>
    </footer>
  )
}
