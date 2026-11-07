export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { fail, isResponse, json, readBody, requireUser, text } from '@/lib/api'

// POST { reason? } — flag a comment for moderators. One report per member per comment.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await requireUser()
  if (isResponse(session)) return session
  const comment = await prisma.comment.findUnique({
    where: { id: params.id },
    select: { id: true, userId: true, deletedAt: true },
  })
  if (!comment || comment.deletedAt) return fail('Comment not found.', 404)
  if (comment.userId === session.user.id) return fail('You cannot report your own comment.')

  const reason = text((await readBody(req)).reason, { max: 300 })
  if (reason === null) return fail('Please keep the reason under 300 characters.')

  await prisma.commentReport.upsert({
    where: { commentId_userId: { commentId: comment.id, userId: session.user.id } },
    create: { commentId: comment.id, userId: session.user.id, reason: reason || null },
    update: { reason: reason || null, resolvedAt: null },
  })
  return json({ ok: true })
}
