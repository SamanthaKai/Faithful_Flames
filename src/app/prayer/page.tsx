export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { getSession } from '@/lib/api'
import { getPublicPrayers } from '@/lib/prayer'
import { PrayerForm } from '@/components/PrayerForm'
import { PrayerWall } from '@/components/PrayerWall'

export const metadata: Metadata = { title: 'Prayer', description: 'Share a prayer request, or pray for others.' }

export default async function PrayerPage() {
  const session = await getSession()
  const prayers = await getPublicPrayers(session?.user?.id ?? null, 60)

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="kicker mb-3">Carry one another</p>
          <h1 className="font-heading text-4xl font-bold leading-tight text-lm-text dark:text-[#FFF4E8] md:text-5xl">
            Bring it to the fire.
          </h1>
          <p className="mt-4 max-w-md leading-relaxed text-lm-muted dark:text-[#BFAEA3]">
            Whatever you are carrying, you don&rsquo;t have to carry it alone. Share a request. Keep it private if you
            like, and we will pray.
          </p>
          <p className="scripture mt-6 text-lg text-lm-text dark:text-[#FFF4E8]/90">
            &ldquo;Bear one another&rsquo;s burdens, and so fulfil the law of Christ.&rdquo;
            <span className="ml-2 font-body text-xs not-italic font-semibold text-ember">Galatians 6:2</span>
          </p>
          <div className="mt-8">
            <PrayerForm />
          </div>
        </div>

        <section aria-labelledby="wall">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 id="wall" className="font-heading text-2xl font-bold text-lm-text dark:text-[#FFF4E8]">The prayer wall</h2>
            <span className="text-xs text-lm-muted dark:text-[#BFAEA3]">Shared with permission</span>
          </div>
          <PrayerWall prayers={prayers} />
        </section>
      </div>
    </div>
  )
}
