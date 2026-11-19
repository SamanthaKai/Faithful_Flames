export const dynamic = 'force-dynamic'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { clientIp, fail, json, looksLikeBot, rateLimited, readBody } from '@/lib/api'
import { findUsableToken } from '@/lib/password-reset'

const EXPIRED = 'This reset link has expired or was already used. Please request a new one.'

// GET ?token= → { valid } so the page can say up front if the link is stale.
export async function GET(req: Request) {
  if (rateLimited(`reset-check:${clientIp(req)}`, 30, 15 * 60_000)) return fail('Please wait a few minutes.', 429)
  const token = new URL(req.url).searchParams.get('token')
  return json({ valid: !!(await findUsableToken(token)) })
}

// POST { token, password } → sets the new password and signs out every device.
export async function POST(req: Request) {
  if (looksLikeBot(req)) return fail('Automated requests are not allowed.', 403)
  if (rateLimited(`reset:${clientIp(req)}`, 10, 15 * 60_000)) return fail('Please wait a few minutes before trying again.', 429)
  const body = await readBody(req)
  const password = typeof body.password === 'string' ? body.password : ''
  // bcrypt only uses the first 72 bytes, so cap the length (same rule as sign-up).
  if (password.length < 8 || password.length > 72) return fail('Password must be 8 to 72 characters.')

  const record = await findUsableToken(body.token)
  if (!record) return fail(EXPIRED, 400)

  const hashed = await bcrypt.hash(password, 12)
  const now = new Date()
  // Mark the token used only if it still is unused, so two quick clicks can't both succeed.
  const claimed = await prisma.passwordResetToken.updateMany({ where: { id: record.id, usedAt: null }, data: { usedAt: now } })
  if (claimed.count === 0) return fail(EXPIRED, 400)

  const user = await prisma.user.findUnique({ where: { id: record.userId }, select: { emailVerified: true } })
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      // Following the emailed link proves they own the address, so it counts as verified.
      data: { password: hashed, passwordChangedAt: now, ...(user?.emailVerified ? {} : { emailVerified: now }) },
    }),
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId, id: { not: record.id } } }),
  ])
  return json({ ok: true })
}
