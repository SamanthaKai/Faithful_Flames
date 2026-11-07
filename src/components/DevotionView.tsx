import Link from 'next/link'
import type { Devotion } from '@prisma/client'
import { getSession } from '@/lib/api'
import { devotionDay, formatDay, todayKey } from '@/lib/day'
import { getDiscussion } from '@/lib/comments'
import { BookmarkButton } from './BookmarkButton'
import { DevotionNote } from './DevotionNote'
import { Discussion } from './Discussion'

function paragraphs(text: string) {
  return text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
}

function Section({ numeral, label, children }: { numeral: string; label: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 md:grid-cols-[88px_1fr] md:gap-8">
      <div className="flex items-baseline gap-3 md:block md:pt-1.5 md:text-right">
        <span className="font-heading text-2xl italic text-ember md:block md:text-3xl">{numeral}</span>
        <span className="kicker md:mt-1 md:block">{label}</span>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

export async function DevotionView({ devotion }: { devotion: Devotion }) {
  const session = await getSession()
  const viewer = session?.user?.id ? { id: session.user.id, role: session.user.role } : null
  const discussion = await getDiscussion(devotion, viewer)
  const day = devotionDay(devotion)
  const isToday = day === todayKey()

  // Older devotions stored a reflection question; fold it into application if needed.
  const application = devotion.application ?? (devotion.reflectionQuestion ? `Reflect: ${devotion.reflectionQuestion}` : null)

  return (
    <div className="animate-fade-in">
      {/* Masthead */}
      <header className="night relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 pb-14 pt-12 sm:px-6 md:pb-20 md:pt-16">
          <div className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
            <span>{isToday ? 'Today' : 'From the archive'}</span>
            <span className="h-px w-8 bg-gold/40" />
            <time dateTime={day}>{formatDay(day)}</time>
          </div>
          <h1 className="max-w-3xl font-heading text-4xl font-bold leading-[1.1] text-[#FFF4E8] sm:text-5xl md:text-6xl">
            {devotion.title}
          </h1>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#discussion" className="btn-ember !py-2.5 text-xs">
              {discussion.open ? 'Join today’s conversation' : 'Read the conversation'}
              {discussion.count > 0 && <span className="rounded-full bg-white/20 px-2 py-0.5">{discussion.count}</span>}
            </a>
            <div className="[&_.btn-ghost]:!border-white/20 [&_.btn-ghost]:!text-[#FFF4E8]">
              <BookmarkButton contentType="DEVOTION" contentId={devotion.id} />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-14 px-4 py-14 sm:px-6 md:py-20">
        <Section numeral="I" label="Scripture">
          {devotion.scriptureText ? (
            <blockquote>
              <p className="scripture text-[1.75rem] leading-snug text-lm-text dark:text-[#FFF4E8] md:text-[2.1rem]">
                &ldquo;{devotion.scriptureText}&rdquo;
              </p>
              <footer className="mt-4 text-sm font-semibold tracking-wide text-ember">{devotion.scripture}</footer>
            </blockquote>
          ) : (
            <p className="scripture text-3xl text-lm-text dark:text-[#FFF4E8]">{devotion.scripture}</p>
          )}
        </Section>

        <Section numeral="II" label="Reflection">
          <div className="prose-fire drop-cap max-w-[68ch]">
            {paragraphs(devotion.teaching).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </Section>

        {application && (
          <Section numeral="III" label="Live it today">
            <div className="rounded-2xl border-l-[3px] border-ember bg-lm-highlight/40 px-6 py-5 dark:bg-ember/[0.06]">
              <div className="prose-fire max-w-[64ch] [&>p:last-child]:mb-0">
                {paragraphs(application).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
          </Section>
        )}

        {devotion.prayerPoint && (
          <Section numeral={application ? 'IV' : 'III'} label="Closing prayer">
            <div className="max-w-[64ch]">
              {paragraphs(devotion.prayerPoint).map((p, i) => (
                <p key={i} className="scripture mb-3 text-xl leading-relaxed text-lm-text dark:text-[#FFF4E8]/90">{p}</p>
              ))}
              <p className="scripture text-xl text-ember">Amen.</p>
            </div>
          </Section>
        )}

        <div className="md:pl-[120px]">
          <DevotionNote devotionId={devotion.id} />
        </div>

        <div className="ember-rule" />

        <div className="md:pl-[120px]">
          <Discussion devotionId={devotion.id} initial={discussion} />
        </div>

        <nav className="flex justify-between border-t border-lm-border pt-8 text-sm dark:border-ember/10 md:ml-[120px]">
          <Link href="/devotions/archive" className="font-semibold text-lm-muted hover:text-ember dark:text-[#BFAEA3]">← Past devotions</Link>
          {!isToday && <Link href="/devotions" className="font-semibold text-ember">Today’s devotion →</Link>}
        </nav>
      </div>
    </div>
  )
}
