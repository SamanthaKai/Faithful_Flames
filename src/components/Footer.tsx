import Link from 'next/link'
import { Logo } from './Logo'
import { WhatsAppContact } from './WhatsAppContact'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-lm-border bg-lm-section dark:border-ember/10 dark:bg-[#0A0808]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo size={28} />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-lm-muted dark:text-[#BFAEA3]">
            A digital campfire for young believers. Gather around the Word each day, carry one another in prayer, and
            tell of what God has done.
          </p>
          <WhatsAppContact />
        </div>
        <div>
          <p className="kicker mb-4">Around the fire</p>
          <ul className="space-y-2.5 text-sm">
            <li><Link className="text-lm-muted hover:text-ember dark:text-[#BFAEA3]" href="/devotions">Daily Devotion</Link></li>
            <li><Link className="text-lm-muted hover:text-ember dark:text-[#BFAEA3]" href="/devotions/archive">Past devotions</Link></li>
            <li><Link className="text-lm-muted hover:text-ember dark:text-[#BFAEA3]" href="/prayer">Prayer</Link></li>
            <li><Link className="text-lm-muted hover:text-ember dark:text-[#BFAEA3]" href="/testimonies">Testimonies</Link></li>
          </ul>
        </div>
        <div>
          <p className="kicker mb-4">Further reading</p>
          <ul className="space-y-2.5 text-sm">
            <li><Link className="text-lm-muted hover:text-ember dark:text-[#BFAEA3]" href="/articles">Articles</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-lm-border dark:border-ember/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-lm-muted dark:text-[#BFAEA3] sm:flex-row sm:px-6">
          <p>&copy; {new Date().getFullYear()} Faithful Flames</p>
          <p className="scripture text-sm">&ldquo;Our God is a consuming fire.&rdquo; Hebrews 12:29</p>
        </div>
      </div>
    </footer>
  )
}
