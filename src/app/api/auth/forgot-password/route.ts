export const dynamic = 'force-dynamic'
import { botCheck, clientIp, json, rateLimited, readBody } from '@/lib/api'
import { findUserByEmail, normalizeEmail } from '@/lib/email-address'
import { createResetToken } from '@/lib/password-reset'
import { sendPasswordResetEmail } from '@/lib/email'

// POST { email, startedAt, website? }
// Always answers the same way, whether or not the email has an account, so
// this form can't be used to find out who is a member.
const DONE = { ok: true }

export async function POST(req: Request) {
  const body = await readBody(req)
  const blocked = botCheck(req, body, DONE)
  if (blocked) return blocked
  if (rateLimited(`forgot-ip:${clientIp(req)}`, 5, 15 * 60_000)) {
    return json({ error: 'Please wait a few minutes before trying again.' }, 429)
  }
  const email = normalizeEmail(body.email)
  if (!email) return json({ error: 'Please enter a valid email address.' }, 400)
  // At most 3 emails an hour to any one address, so nobody can flood an inbox.
  if (rateLimited(`forgot:${email}`, 3, 60 * 60_000)) return json(DONE)

  const user = await findUserByEmail(email)
  if (user) {
    try {
      const token = await createResetToken(user.id)
      await sendPasswordResetEmail(user.email, token)
    } catch (err) {
      console.error('Password reset email failed:', err)
    }
  }
  return json(DONE)
}
