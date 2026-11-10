export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { isResponse, json, requireAdmin } from '@/lib/api'
import { startOfDay, todayKey } from '@/lib/day'

const MIN = 60_000
const DAY = 24 * 60 * MIN

// GET → registered members with their engagement, plus site-wide engagement.
// Admin only. Private notes are never included (not even counts).
export async function GET() {
  const session = await requireAdmin()
  if (isResponse(session)) return session

  const now = Date.now()
  const startToday = startOfDay(todayKey())
  const weekAgo = new Date(now - 7 * DAY)
  const activeCutoff = new Date(now - 15 * MIN)

  const [users, comments7, likes7, reads7, devotions, devComments, devLikes, devReads] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ lastSeenAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
      select: {
        id: true, name: true, email: true, role: true, emailVerified: true, createdAt: true, lastSeenAt: true, readingPath: true,
        _count: {
          select: {
            comments: { where: { deletedAt: null } },
            likes: true,
            devotionReads: true,
            prayerRequests: true,
            prayedFor: true,
            testimonies: true,
            bookmarks: true,
          },
        },
      },
    }),
    prisma.comment.count({ where: { contentType: 'DEVOTION', deletedAt: null, createdAt: { gte: weekAgo } } }),
    prisma.like.count({ where: { contentType: { in: ['DEVOTION', 'COMMENT'] }, createdAt: { gte: weekAgo } } }),
    prisma.devotionRead.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.devotion.findMany({ where: { isPublished: true }, select: { id: true, title: true, dayKey: true, publishedAt: true } }),
    prisma.comment.groupBy({ by: ['contentId'], where: { contentType: 'DEVOTION', deletedAt: null }, _count: { _all: true } }),
    prisma.like.groupBy({ by: ['contentId'], where: { contentType: 'DEVOTION' }, _count: { _all: true } }),
    prisma.devotionRead.groupBy({ by: ['devotionId'], _count: { _all: true } }),
  ])

  const cMap = new Map(devComments.map((r) => [r.contentId, r._count._all]))
  const lMap = new Map(devLikes.map((r) => [r.contentId, r._count._all]))
  const rMap = new Map(devReads.map((r) => [r.devotionId, r._count._all]))
  const devotionStats = devotions
    .map((d) => ({
      id: d.id,
      title: d.title,
      day: d.dayKey ?? d.publishedAt.toISOString().slice(0, 10),
      readers: rMap.get(d.id) ?? 0,
      likes: lMap.get(d.id) ?? 0,
      comments: cMap.get(d.id) ?? 0,
    }))
    .sort((a, b) => b.readers + b.likes + b.comments - (a.readers + a.likes + a.comments) || (a.day < b.day ? 1 : -1))

  const seen = (u: { lastSeenAt: Date | null }, since: Date) => !!u.lastSeenAt && u.lastSeenAt >= since

  return json({
    summary: {
      members: users.length,
      verified: users.filter((u) => u.emailVerified).length,
      activeNow: users.filter((u) => seen(u, activeCutoff)).length,
      activeToday: users.filter((u) => seen(u, startToday)).length,
      active7: users.filter((u) => seen(u, weekAgo)).length,
      new7: users.filter((u) => u.createdAt >= weekAgo).length,
      comments7,
      likes7,
      reads7,
      fromBeginning: users.filter((u) => u.readingPath === 'BEGINNING').length,
      fromLatest: users.filter((u) => u.readingPath === 'LATEST').length,
    },
    members: users.map(({ _count, emailVerified, ...u }) => ({
      ...u,
      verified: !!emailVerified,
      activeNow: seen(u, activeCutoff),
      counts: _count,
    })),
    devotions: devotionStats,
  })
}
