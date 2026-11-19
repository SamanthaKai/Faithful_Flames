export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { fail, isResponse, json, rateLimited, readBody, requireUser, text } from '@/lib/api'

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

// DELETE { password } — the password is required for accounts that have one.
export async function DELETE(req: Request) {
  const session = await requireUser()
  if (isResponse(session)) return session
  if (rateLimited(`delete-account:${session.user.id}`, 5, 15 * 60_000)) return fail('Too many attempts. Please wait 15 minutes.', 429)
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { password: true } })
  if (!user) return fail('Account not found.', 404)
  if (user.password) {
    const { password } = await readBody(req)
    if (typeof password !== 'string' || !password || !(await bcrypt.compare(password, user.password))) {
      return fail('That password isn’t right.', 403)
    }
  }
  // Other members' replies to this user's comments survive as top-level comments.
  await prisma.$transaction([
    prisma.comment.updateMany({ where: { parent: { userId: session.user.id } }, data: { parentId: null } }),
    prisma.user.delete({ where: { id: session.user.id } }),
  ])
  return json({ ok: true })
}
