export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required.' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email } })

  // Always return 200 for unknown emails — don't reveal whether an account exists.
  if (!user) return NextResponse.json({ ok: true }, { status: 200 })

  if (user.emailVerified) {
    return NextResponse.json({ error: 'Email already verified.' }, { status: 400 })
  }

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
  } catch {
    // swallow — client sees 200 either way
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
