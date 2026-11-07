export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { fail, isResponse, json, readBody, requireAdmin } from '@/lib/api'
import { parseDevotion } from '../parse'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  const existing = await prisma.devotion.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!existing) return fail('Devotion not found.', 404)

  const parsed = parseDevotion(await readBody(req), false)
  if ('error' in parsed) return fail(parsed.error)

  if (parsed.data.dayKey) {
    const clash = await prisma.devotion.findFirst({
      where: { dayKey: parsed.data.dayKey, id: { not: params.id } },
      select: { title: true },
    })
    if (clash) return fail(`Another devotion already uses that day ("${clash.title}").`, 409)
  }

  const devotion = await prisma.devotion.update({ where: { id: params.id }, data: parsed.data })
  return json(devotion)
}

// Only devotions with no discussion and no member notes can be deleted;
// otherwise unpublish, so nobody's comments or notes are lost.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  const [comments, notes] = await Promise.all([
    prisma.comment.count({ where: { contentType: 'DEVOTION', contentId: params.id } }),
    prisma.reflection.count({ where: { devotionId: params.id } }),
  ])
  if (comments || notes) {
    return fail(`This devotion has ${comments} comment(s) and ${notes} private note(s). Unpublish it instead of deleting.`, 409)
  }
  await prisma.bookmark.deleteMany({ where: { contentType: 'DEVOTION', contentId: params.id } })
  await prisma.devotion.delete({ where: { id: params.id } })
  return json({ ok: true })
}
