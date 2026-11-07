export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getFeaturedDevotion } from '@/lib/devotions'
import { formatDay } from '@/lib/day'
import { DevotionView } from '@/components/DevotionView'
import { Campfire } from '@/components/Campfire'

export const metadata: Metadata = { title: 'Daily Devotion' }

// "Daily Devotion" shows today's devotion in full. If today's has not been
// published, it says so and points to the most recent one.
export default async function TodayPage() {
  const { devotion, isToday, today } = await getFeaturedDevotion()

  if (devotion && isToday) {
    const full = await prisma.devotion.findUnique({ where: { id: devotion.id } })
    if (full) return <DevotionView devotion={full} />
  }

  return (
    <div className="night relative overflow-hidden">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:px-6">
        <Campfire lit={false} className="mb-6 h-40 w-auto" />
        <p className="kicker mb-3 !text-gold">{formatDay(today)}</p>
        <h1 className="font-heading text-4xl font-bold text-[#FFF4E8]">Today&rsquo;s fire is still being laid</h1>
        <p className="mt-4 text-[#BFAEA3]">
          Today&rsquo;s devotion hasn&rsquo;t been published yet. Check back soon.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {devotion && (
            <Link href={`/devotions/${devotion.id}`} className="btn-ember">Read the most recent devotion</Link>
          )}
          <Link href="/devotions/archive" className="btn-ghost !border-white/20 !text-[#FFF4E8]">Past devotions</Link>
        </div>
      </div>
    </div>
  )
}
