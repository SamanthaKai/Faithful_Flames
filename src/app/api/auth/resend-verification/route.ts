export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import { clientIp, looksLikeBot, rateLimited, readBody } from '@/lib/api'
import { findUserByEmail, normalizeEmail } from '@/lib/email-address'

export async function POST(req: Request) {
  if (looksLikeBot(req)) return NextResponse.json({ error: 'Automated requests are not allowed.' }, { status: 403 })
  if (rateLimited(`resend:${clientIp(req)}`, 5, 15 * 60_000)) {
    return NextResponse.json({ error: 'Please wait a few minutes before requesting another email.' }, { status: 429 })
  }
  const input = normalizeEmail((await readBody(req)).email)
  if (!input) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })

  const user = await findUserByEmail(input)

  // Always return 200 for unknown emails — don't reveal whether an account exists.
  if (!user) return NextResponse.json({ ok: true }, { status: 200 })

  if (user.emailVerified) {
    return NextResponse.json({ error: 'Email already verified.' }, { status: 400 })
  }

  // Tokens are keyed by the email exactly as stored on the account.
  const email = user.email

  // Rate limit: if a token was issued in the last 60 seconds, reject.
  // The token's expiry is set to now+24h, so if expires > now+24h-60s the send was recent.
  const existing = await prisma.verificationToken.findFirst({ where: { identifier: email } })
  const ONE_MINUTE_MS = 60 * 1000
  if (existing && existing.expires.getTime() > Date.now() + 24 * 60 * 60 * 1000 - ONE_MINUTE_MS) {
    return NextResponse.json(
      { error: 'Please wait a moment before requesting another email.' },
      { status: 429 }
    )
  }

  const token = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await prisma.verificationToken.deleteMany({ where: { identifier: email } })
  await prisma.verificationToken.create({ data: { identifier: email, token, expires } })

  try {
    await sendVerificationEmail(email, token)
  } catch (err) {
    console.error('Verification email failed (resend):', err)
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
