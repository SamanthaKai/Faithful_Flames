export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { isResponse, json, requireAdmin } from '@/lib/api'
import { addDays, todayKey } from '@/lib/day'

export async function GET() {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  const today = todayKey()
  const from = addDays(today, -13)

  const [visits, pendingTestimonies, pendingPrayer, openReports, todaysDevotion] = await Promise.all([
    prisma.dailyVisit.groupBy({
      by: ['day'],
      where: { day: { gte: from } },
      _count: { _all: true },
      _sum: { views: true },
    }),
    prisma.testimony.count({ where: { isApproved: false, reviewedAt: null } }),
    prisma.prayerRequest.count({ where: { status: 'PENDING' } }),
    prisma.comment.count({ where: { deletedAt: null, reports: { some: { resolvedAt: null } } } }),
    prisma.devotion.findFirst({ where: { dayKey: today }, select: { id: true, title: true, isPublished: true } }),
  ])

  const byDay = new Map(visits.map((v) => [v.day, { visitors: v._count._all, views: v._sum.views ?? 0 }]))
  const days = Array.from({ length: 14 }, (_, i) => {
    const day = addDays(from, i)
    return { day, ...(byDay.get(day) ?? { visitors: 0, views: 0 }) }
  })

  return json({ today, days, pendingTestimonies, pendingPrayer, openReports, todaysDevotion })
}
