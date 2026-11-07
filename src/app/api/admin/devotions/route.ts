export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { fail, isResponse, json, readBody, requireAdmin } from '@/lib/api'
import { parseDevotion } from './parse'

export async function GET() {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  const devotions = await prisma.devotion.findMany({ orderBy: [{ dayKey: 'desc' }, { publishedAt: 'desc' }] })
  const counts = await prisma.comment.groupBy({
    by: ['contentId'],
    where: { contentType: 'DEVOTION', deletedAt: null },
    _count: { _all: true },
  })
  const countMap = new Map(counts.map((c) => [c.contentId, c._count._all]))
  return json(devotions.map((d) => ({ ...d, commentCount: countMap.get(d.id) ?? 0 })))
}

export async function POST(req: Request) {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  const parsed = parseDevotion(await readBody(req), true)
  if ('error' in parsed) return fail(parsed.error)

  const clash = await prisma.devotion.findFirst({ where: { dayKey: parsed.data.dayKey }, select: { id: true, title: true } })
  if (clash) return fail(`There is already a devotion for that day ("${clash.title}"). Edit it instead.`, 409)

  const devotion = await prisma.devotion.create({ data: parsed.data })
  return json(devotion, 201)
}
