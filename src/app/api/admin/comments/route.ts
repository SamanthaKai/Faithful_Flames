export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { isResponse, json, requireAdmin } from '@/lib/api'

// GET ?filter=reported|recent
export async function GET(req: Request) {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  const filter = new URL(req.url).searchParams.get('filter') ?? 'reported'

  const comments = await prisma.comment.findMany({
    where: {
      contentType: 'DEVOTION',
      deletedAt: null,
      ...(filter === 'reported' ? { reports: { some: { resolvedAt: null } } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      reports: { where: { resolvedAt: null }, select: { reason: true, createdAt: true } },
    },
  })
  const devotionIds = Array.from(new Set(comments.map((c) => c.contentId)))
  const devotions = await prisma.devotion.findMany({ where: { id: { in: devotionIds } }, select: { id: true, title: true } })
  const titles = new Map(devotions.map((d) => [d.id, d.title]))
  return json(comments.map((c) => ({ ...c, devotionTitle: titles.get(c.contentId) ?? 'Devotion' })))
}
