export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/api'
import { devotionDay, formatDay } from '@/lib/day'
import { excerpt } from '@/lib/devotions'
import { AccountSettings } from '@/components/AccountSettings'
import { ReadingPathSetting } from '@/components/ReadingPathSetting'
import { getJourney } from '@/lib/journey'

export const metadata: Metadata = { title: 'My bookmarks & notes' }

export default async function MySpacePage() {
  const session = await getSession()
  if (!session?.user?.id) redirect('/login?callbackUrl=/profile')
  const userId = session.user.id

  const [user, bookmarks, notes, legacyReflections, journal, journey] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
    prisma.bookmark.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.reflection.findMany({
      where: { userId, devotionId: { not: null } },
      orderBy: { updatedAt: 'desc' },
      include: { devotion: { select: { id: true, title: true, scripture: true, dayKey: true, publishedAt: true, isPublished: true } } },
    }),
    prisma.reflection.findMany({ where: { userId, devotionId: null }, orderBy: { createdAt: 'desc' } }),
    prisma.journalEntry.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    getJourney(userId),
  ])

  const devotionIds = bookmarks.filter((b) => b.contentType === 'DEVOTION').map((b) => b.contentId)
  const articleIds = bookmarks.filter((b) => b.contentType === 'ARTICLE').map((b) => b.contentId)
  const [devotions, articles] = await Promise.all([
    prisma.devotion.findMany({ where: { id: { in: devotionIds }, isPublished: true }, select: { id: true, title: true, scripture: true, dayKey: true, publishedAt: true } }),
    prisma.article.findMany({ where: { id: { in: articleIds }, isPublished: true }, select: { id: true, title: true, category: true } }),
  ])
  const dMap = new Map(devotions.map((d) => [d.id, d]))
  const aMap = new Map(articles.map((a) => [a.id, a]))

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 md:py-20">
      <p className="kicker mb-3">Only you can see this page</p>
      <h1 className="font-heading text-4xl font-bold text-lm-text dark:text-[#FFF4E8] md:text-5xl">Your bookmarks &amp; notes</h1>

      <section className="mt-14" aria-labelledby="path">
        <h2 id="path" className="font-heading text-2xl font-bold text-lm-text dark:text-[#FFF4E8]">Your reading</h2>
        <p className="mt-2 text-sm text-lm-muted dark:text-[#BFAEA3]">
          You&rsquo;ve opened {journey.readCount} of {journey.total} devotions.{' '}
          {journey.next && (
            <Link href={`/devotions/${journey.next.id}`} className="font-semibold text-ember hover:underline">
              {journey.path === 'BEGINNING' ? 'Continue' : 'First unread'}: Day {journey.next.number}, {journey.next.title} →
            </Link>
          )}
        </p>
        <ReadingPathSetting path={journey.path} />
      </section>

      <section className="mt-14" aria-labelledby="bm">
        <h2 id="bm" className="font-heading text-2xl font-bold text-lm-text dark:text-[#FFF4E8]">Saved</h2>
        {bookmarks.length === 0 ? (
          <p className="mt-3 text-sm text-lm-muted dark:text-[#BFAEA3]">Nothing saved yet. Use <strong>Save</strong> on a devotion or article to keep it here.</p>
        ) : (
          <ul className="mt-4 divide-y divide-lm-border border-y border-lm-border dark:divide-ember/10 dark:border-ember/10">
            {bookmarks.map((b) => {
              if (b.contentType === 'DEVOTION') {
                const d = dMap.get(b.contentId)
                if (!d) return null
                return (
                  <li key={b.id}>
                    <Link href={`/devotions/${d.id}`} className="group flex items-baseline justify-between gap-4 py-4">
                      <span>
                        <span className="kicker mr-3">Devotion</span>
                        <span className="font-heading text-lg font-bold text-lm-text group-hover:text-ember dark:text-[#FFF4E8]">{d.title}</span>
                      </span>
                      <span className="shrink-0 text-xs text-lm-muted dark:text-[#BFAEA3]">{formatDay(devotionDay(d), { weekday: undefined })}</span>
                    </Link>
                  </li>
                )
              }
              const a = aMap.get(b.contentId)
              if (!a) return null
              return (
                <li key={b.id}>
                  <Link href={`/articles/${a.id}`} className="group flex items-baseline justify-between gap-4 py-4">
                    <span>
                      <span className="kicker mr-3">Article</span>
                      <span className="font-heading text-lg font-bold text-lm-text group-hover:text-ember dark:text-[#FFF4E8]">{a.title}</span>
                    </span>
                    <span className="shrink-0 text-xs text-lm-muted dark:text-[#BFAEA3]">{a.category}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="mt-14" aria-labelledby="notes">
        <h2 id="notes" className="font-heading text-2xl font-bold text-lm-text dark:text-[#FFF4E8]">Your notes</h2>
        {notes.length === 0 ? (
          <p className="mt-3 text-sm text-lm-muted dark:text-[#BFAEA3]">Notes you write on a devotion will be gathered here.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {notes.map((n) => (
              <li key={n.id} className="panel p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  {n.devotion?.isPublished ? (
                    <Link href={`/devotions/${n.devotion.id}`} className="font-heading text-lg font-bold text-lm-text hover:text-ember dark:text-[#FFF4E8]">
                      {n.devotion.title}
                    </Link>
                  ) : (
                    <span className="font-heading text-lg font-bold text-lm-text dark:text-[#FFF4E8]">{n.title}</span>
                  )}
                  <span className="text-xs text-lm-muted dark:text-[#BFAEA3]">
                    {n.devotion ? formatDay(devotionDay(n.devotion), { weekday: undefined }) : ''}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-lm-muted dark:text-[#BFAEA3]">{excerpt(n.content, 320)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {(legacyReflections.length > 0 || journal.length > 0) && (
        <section className="mt-14" aria-labelledby="earlier">
          <h2 id="earlier" className="font-heading text-2xl font-bold text-lm-text dark:text-[#FFF4E8]">Earlier writing</h2>
          <p className="mt-2 text-sm text-lm-muted dark:text-[#BFAEA3]">
            Reflections and prayer-journal entries you wrote before we simplified the site. They are still private and
            kept safe here.
          </p>
          <div className="mt-4 space-y-3">
            {[...legacyReflections.map((r) => ({ id: r.id, kind: 'Reflection', title: r.title, content: r.content, at: r.createdAt })),
              ...journal.map((j) => ({ id: j.id, kind: 'Prayer journal', title: j.title, content: j.content, at: j.createdAt }))]
              .sort((a, b) => +b.at - +a.at)
              .map((e) => (
                <details key={e.id} className="panel group p-5">
                  <summary className="flex cursor-pointer list-none items-baseline justify-between gap-3">
                    <span>
                      <span className="kicker mr-3">{e.kind}</span>
                      <span className="font-semibold text-lm-text dark:text-[#FFF4E8]">{e.title}</span>
                    </span>
                    <span className="shrink-0 text-xs text-lm-muted dark:text-[#BFAEA3]">{e.at.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </summary>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-lm-muted dark:text-[#BFAEA3]">{e.content}</p>
                </details>
              ))}
          </div>
        </section>
      )}

      <section className="mt-16 border-t border-lm-border pt-10 dark:border-ember/10" aria-labelledby="acct">
        <h2 id="acct" className="font-heading text-2xl font-bold text-lm-text dark:text-[#FFF4E8]">Account</h2>
        <AccountSettings name={user?.name ?? ''} email={user?.email ?? ''} />
      </section>
    </div>
  )
}
