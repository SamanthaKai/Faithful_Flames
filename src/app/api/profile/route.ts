export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { fail, isResponse, json, readBody, requireUser, text } from '@/lib/api'

// The account is intentionally small: a display name (shown on comments) and email.
export async function GET() {
  const session = await requireUser()
  if (isResponse(session)) return session
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true },
  })
  return json(user)
}

export async function PATCH(req: Request) {
  const session = await requireUser()
  if (isResponse(session)) return session
  const name = text((await readBody(req)).name, { min: 2, max: 40 })
  if (!name) return fail('Display name must be 2 to 40 characters.')
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name },
    select: { id: true, name: true, email: true },
  })
  return json(user)
}

export async function DELETE() {
  const session = await requireUser()
  if (isResponse(session)) return session
  // Other members' replies to this user's comments survive as top-level comments.
  await prisma.$transaction([
    prisma.comment.updateMany({ where: { parent: { userId: session.user.id } }, data: { parentId: null } }),
    prisma.user.delete({ where: { id: session.user.id } }),
  ])
  return json({ ok: true })
}
