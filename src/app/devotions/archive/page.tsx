export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getVisibleDevotions, excerpt } from '@/lib/devotions'
import { formatDay, todayKey } from '@/lib/day'

export const metadata: Metadata = { title: 'Past devotions' }

export default async function ArchivePage() {
  const devotions = await getVisibleDevotions()
  const today = todayKey()

  // Group by month: "November 2026"
  const groups = new Map<string, typeof devotions>()
  for (const d of devotions) {
    const month = formatDay(d.day, { weekday: undefined, day: undefined, month: 'long', year: 'numeric' })
    groups.set(month, [...(groups.get(month) ?? []), d])
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 md:py-20">
      <p className="kicker mb-3">The logbook</p>
      <h1 className="font-heading text-4xl font-bold text-lm-text dark:text-[#FFF4E8] md:text-5xl">Past devotions</h1>
      <p className="mt-4 max-w-xl text-lm-muted dark:text-[#BFAEA3]">
        Every fire we have gathered around. Each devotion and its conversation stays here to read.
      </p>

      {devotions.length === 0 && <p className="mt-12 text-lm-muted dark:text-[#BFAEA3]">No devotions yet. The first fire is coming soon.</p>}

      {Array.from(groups.entries()).map(([month, list]) => (
        <section key={month} className="mt-14">
          <h2 className="kicker mb-2 border-b border-lm-border pb-3 dark:border-ember/10">{month}</h2>
          <ol>
            {list.map((d) => {
              const date = new Date(`${d.day}T12:00:00+03:00`)
              return (
                <li key={d.id}>
                  <Link
                    href={d.day === today ? '/devotions' : `/devotions/${d.id}`}
                    className="group grid grid-cols-[56px_1fr] gap-5 border-b border-lm-border/70 py-6 dark:border-ember/[0.07] sm:grid-cols-[72px_1fr]"
                  >
                    <div className="text-center">
                      <div className="font-heading text-3xl font-bold leading-none text-lm-text group-hover:text-ember dark:text-[#FFF4E8] sm:text-4xl">
                        {date.toLocaleDateString('en-GB', { day: 'numeric', timeZone: 'Africa/Kampala' })}
                      </div>
                      <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-lm-muted dark:text-[#BFAEA3]">
                        {date.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'Africa/Kampala' })}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <h3 className="font-heading text-xl font-bold text-lm-text group-hover:text-ember dark:text-[#FFF4E8]">{d.title}</h3>
                        {d.day === today && <span className="rounded-full bg-ember px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Today</span>}
                      </div>
                      <p className="mt-1 text-sm font-semibold text-ember">{d.scripture}</p>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-lm-muted dark:text-[#BFAEA3]">{excerpt(d.teaching, 200)}</p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </div>
  )
}
