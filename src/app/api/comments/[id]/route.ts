export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { fail, isResponse, json, readBody, requireUser, text } from '@/lib/api'
import { isDiscussionOpen } from '@/lib/day'
import { containsProfanity } from '@/lib/profanity'

async function loadOwnOpenComment(id: string, userId: string) {
  const comment = await prisma.comment.findUnique({ where: { id } })
  if (!comment || comment.deletedAt) return { error: fail('Comment not found.', 404) }
  if (comment.userId !== userId) return { error: fail('Forbidden', 403) }
  if (comment.contentType !== 'DEVOTION') return { error: fail('This comment is read-only.', 403) }
  const devotion = await prisma.devotion.findUnique({
    where: { id: comment.contentId },
    select: { dayKey: true, publishedAt: true },
  })
  if (!devotion || !isDiscussionOpen(devotion)) {
    return { error: fail('This discussion has closed and is now read-only.', 403) }
  }
  return { comment }
}

// PATCH { content } — authors may edit while the discussion is open.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireUser()
  if (isResponse(session)) return session
  const { error, comment } = await loadOwnOpenComment(params.id, session.user.id)
  if (error) return error
  if (comment.isHidden) return fail('This comment was hidden by a moderator.', 403)

  const content = text((await readBody(req)).content, { min: 1, max: 2000 })
  if (content === null) return fail('Comments must be between 1 and 2,000 characters.')
  if (containsProfanity(content)) return fail('Please keep the language kind and clean.')
  await prisma.comment.update({ where: { id: comment.id }, data: { content } })
  return json({ ok: true })
}

// DELETE — authors may remove their own comment while the discussion is open.
// Soft delete, so replies written by others are never lost.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireUser()
  if (isResponse(session)) return session
  const { error, comment } = await loadOwnOpenComment(params.id, session.user.id)
  if (error) return error
  await prisma.comment.update({ where: { id: comment.id }, data: { deletedAt: new Date(), content: '' } })
  return json({ ok: true })
}
