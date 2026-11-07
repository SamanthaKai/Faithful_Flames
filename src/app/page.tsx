export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/api'
import { getFeaturedDevotion, excerpt } from '@/lib/devotions'
import { endOfDay, formatDay } from '@/lib/day'
import { getPublicPrayers } from '@/lib/prayer'
import { getPublishedTestimonies } from '@/lib/testimonies'
import { Campfire } from '@/components/Campfire'
import { EmberParticles } from '@/components/EmberParticles'
import { Stars } from '@/components/Stars'
import { EmberClock } from '@/components/EmberClock'
import { PrayerWall } from '@/components/PrayerWall'

export default async function HomePage() {
  const session = await getSession()
  const [{ devotion, isToday, today }, prayers, testimonies] = await Promise.all([
    getFeaturedDevotion(),
    getPublicPrayers(session?.user?.id ?? null, 3),
    getPublishedTestimonies(3),
  ])
  const commentCount = devotion
    ? await prisma.comment.count({ where: { contentType: 'DEVOTION', contentId: devotion.id, deletedAt: null, isHidden: false } })
    : 0
  const devotionHref = devotion ? (isToday ? '/devotions' : `/devotions/${devotion.id}`) : '/devotions'

  return (
    <div>
      {/* ── I. The fire ─────────────────────────────────────────────────── */}
      <section className="night relative overflow-hidden" aria-labelledby="hero-title">
        <Stars />
        <div className="relative mx-auto grid max-w-6xl items-end gap-10 px-4 pb-0 pt-14 sm:px-6 md:pt-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="pb-12 lg:pb-24">
            <p className="mb-6 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">
              <span>Faithful Flames</span>
              <span className="h-px w-8 bg-gold/40" />
              <time dateTime={today}>{formatDay(today)}</time>
            </p>
            <h1 id="hero-title" className="font-heading text-[2.6rem] font-bold leading-[1.05] text-[#FFF4E8] sm:text-6xl md:text-7xl">
              Pull up a seat<br />
              <span className="italic text-gold">by the fire.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-[#BFAEA3] md:text-lg">
              A digital campfire for young believers. Each day we gather around one passage of Scripture, talk about it
              together, pray for one another, and tell of what God has done.
            </p>

            {devotion && (
              <figure className="mt-10 max-w-xl border-l-2 border-ember/70 pl-6">
                <blockquote className="scripture text-2xl leading-snug text-[#FFF4E8] md:text-[1.9rem]">
                  &ldquo;{excerpt(devotion.scriptureText ?? devotion.scripture, 190)}&rdquo;
                </blockquote>
                {devotion.scriptureText && (
                  <figcaption className="mt-3 text-sm font-semibold tracking-wide text-ember">{devotion.scripture}</figcaption>
                )}
              </figure>
            )}

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href={devotionHref} className="btn-ember">{isToday ? 'Read today’s devotion' : 'Read the latest devotion'}</Link>
              <Link href="/prayer" className="btn-ghost !border-white/20 !text-[#FFF4E8] hover:!border-ember">Ask for prayer</Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md self-end">
            <EmberParticles />
            <Campfire className="relative w-full" />
          </div>
        </div>
      </section>

      {/* ── II. Today's devotion ────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28" aria-labelledby="today-title">
        {devotion ? (
          <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
            <div>
              <p className="kicker mb-4">{isToday ? 'Today’s devotion' : 'The most recent devotion'}</p>
              <h2 id="today-title" className="font-heading text-4xl font-bold leading-tight text-lm-text dark:text-[#FFF4E8] md:text-5xl">
                <Link href={devotionHref} className="hover:text-ember">{devotion.title}</Link>
              </h2>
              <p className="mt-4 font-semibold text-ember">{devotion.scripture}</p>
              {!isToday && (
                <p className="mt-4 text-sm text-lm-muted dark:text-[#BFAEA3]">Today&rsquo;s devotion is on its way. Here is the latest one.</p>
              )}
            </div>
            <div>
              <p className="first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:font-heading first-letter:text-[3.6rem] first-letter:font-bold first-letter:leading-[0.85] first-letter:text-ember text-lg leading-[1.85] text-lm-text dark:text-[#FFF4E8]/85">
                {excerpt(devotion.teaching, 420)}
              </p>
              <div className="mt-8 flex flex-col gap-5 border-t border-lm-border pt-6 dark:border-ember/10 sm:flex-row sm:items-center sm:justify-between">
                <EmberClock closesAt={endOfDay(devotion.day).toISOString()} open={isToday} compact />
                <Link href={`${devotionHref}#discussion`} className="btn-ghost shrink-0">
                  Read &amp; discuss{commentCount > 0 && ` · ${commentCount}`}
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="kicker mb-3">Today&rsquo;s devotion</p>
            <h2 id="today-title" className="font-heading text-3xl font-bold text-lm-text dark:text-[#FFF4E8]">The first fire is being laid.</h2>
            <p className="mt-3 text-lm-muted dark:text-[#BFAEA3]">Devotions will appear here soon.</p>
          </div>
        )}
      </section>

      {/* ── III. Prayer & testimonies ───────────────────────────────────── */}
      <section className="border-y border-lm-border bg-lm-section dark:border-ember/10 dark:bg-[#0A0808]">
        <div className="mx-auto grid max-w-6xl gap-16 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-24">
          <div>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="kicker mb-3">Pray with us</p>
                <h2 className="font-heading text-3xl font-bold text-lm-text dark:text-[#FFF4E8]">On the prayer wall</h2>
              </div>
              <Link href="/prayer" className="shrink-0 text-sm font-semibold text-ember hover:underline">All requests →</Link>
            </div>
            <PrayerWall prayers={prayers} compact />
            <Link href="/prayer" className="btn-ghost mt-8">Share a prayer request</Link>
          </div>

          <div>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="kicker mb-3">Told around the fire</p>
                <h2 className="font-heading text-3xl font-bold text-lm-text dark:text-[#FFF4E8]">Recent testimonies</h2>
              </div>
              <Link href="/testimonies" className="shrink-0 text-sm font-semibold text-ember hover:underline">All stories →</Link>
            </div>
            {testimonies.length === 0 ? (
              <p className="text-sm text-lm-muted dark:text-[#BFAEA3]">No testimonies yet. Yours could be the first.</p>
            ) : (
              <ul className="divide-y divide-lm-border dark:divide-ember/10">
                {testimonies.map((t) => (
                  <li key={t.id}>
                    <Link href={`/testimonies/${t.id}`} className="group block py-5 first:pt-0">
                      <h3 className="font-heading text-xl font-bold text-lm-text group-hover:text-ember dark:text-[#FFF4E8]">{t.title}</h3>
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-lm-muted dark:text-[#BFAEA3]">{excerpt(t.content, 150)}</p>
                      <p className="mt-2 text-xs font-semibold text-lm-muted dark:text-[#BFAEA3]">{t.author ?? 'Anonymous'}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/testimonies#share" className="btn-ghost mt-8">Share your testimony</Link>
          </div>
        </div>
      </section>

      {/* ── IV. Invitation ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 md:py-28">
        <Campfire className="mx-auto mb-6 h-20 w-auto" />
        <h2 className="font-heading text-3xl font-bold text-lm-text dark:text-[#FFF4E8] md:text-4xl">There&rsquo;s room by the fire.</h2>
        <p className="mx-auto mt-4 max-w-lg leading-relaxed text-lm-muted dark:text-[#BFAEA3]">
          Anyone can read, pray and share. Members can also save devotions, keep private notes, and join each
          day&rsquo;s conversation.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {session ? (
            <Link href={`${devotionHref}#discussion`} className="btn-ember">Join today&rsquo;s conversation</Link>
          ) : (
            <>
              <Link href="/register" className="btn-ember">Create a free account</Link>
              <Link href="/login" className="btn-ghost">Sign in</Link>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
