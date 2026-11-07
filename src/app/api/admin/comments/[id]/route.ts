export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { fail, isResponse, json, readBody, requireAdmin } from '@/lib/api'

// PATCH { hidden?: boolean, resolve?: true } — moderation never deletes comments.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  const body = await readBody(req)
  const comment = await prisma.comment.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!comment) return fail('Not found.', 404)

  if (typeof body.hidden === 'boolean') {
    await prisma.comment.update({ where: { id: comment.id }, data: { isHidden: body.hidden } })
  }
  if (body.resolve === true || typeof body.hidden === 'boolean') {
    await prisma.commentReport.updateMany({ where: { commentId: comment.id, resolvedAt: null }, data: { resolvedAt: new Date() } })
  }
  return json({ ok: true })
}
