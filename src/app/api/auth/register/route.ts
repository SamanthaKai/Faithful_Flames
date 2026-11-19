export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendAccountExistsEmail, sendVerificationEmail } from '@/lib/email'
import { botCheck, clientIp, rateLimited, readBody, text } from '@/lib/api'
import { findUserByEmail, normalizeEmail } from '@/lib/email-address'

export async function POST(req: Request) {
  const body = await readBody(req)
  const blocked = botCheck(req, body)
  if (blocked) return blocked
  if (rateLimited(`register:${clientIp(req)}`, 5, 60 * 60_000)) {
    return NextResponse.json({ error: 'Too many sign-ups from this network. Please try again later.' }, { status: 429 })
  }
  const email = normalizeEmail(body.email)
  const name = text(body.name, { max: 40 })
  const password = typeof body.password === 'string' ? body.password : ''

  if (!email) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  if (name === null) return NextResponse.json({ error: 'Name must be 40 characters or fewer.' }, { status: 400 })
  // bcrypt only uses the first 72 bytes, so cap the length.
  if (password.length < 8 || password.length > 72) {
    return NextResponse.json({ error: 'Password must be 8 to 72 characters.' }, { status: 400 })
  }

  // Hash first, so both paths below take about the same time.
  const hashed = await bcrypt.hash(password, 12)

  // If the email already has an account, answer exactly as for a new sign-up,
  // so this form can't reveal who is a member. The owner gets an email instead:
  // a fresh verification link if they never verified, otherwise a note with
  // sign-in and password-reset links. At most 3 such emails an hour per address.
  const existing = await findUserByEmail(email)
  if (existing) {
    if (!rateLimited(`register-existing:${existing.email}`, 3, 60 * 60_000)) {
      try {
        if (existing.emailVerified) {
          await sendAccountExistsEmail(existing.email)
        } else {
          const token = randomBytes(32).toString('hex')
          await prisma.verificationToken.deleteMany({ where: { identifier: existing.email } })
          await prisma.verificationToken.create({ data: { identifier: existing.email, token, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) } })
          await sendVerificationEmail(existing.email, token)
        }
      } catch (err) {
        console.error('Email failed (register, existing account):', err)
      }
    }
    return NextResponse.json({ ok: true }, { status: 201 })
  }

  // Registration never grants admin; admins are managed with `npm run admin`.
  await prisma.user.create({
    data: {
      name: name || null,
      email,
      password: hashed,
      role: 'USER',
      // emailVerified is intentionally null until the user clicks the link
    },
  })

  // Generate a 32-byte hex token and store it with a 24-hour expiry.
  // deleteMany first so re-registrations never leave stale tokens.
  const token = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await prisma.verificationToken.deleteMany({ where: { identifier: email } })
  await prisma.verificationToken.create({ data: { identifier: email, token, expires } })

  // Email failure never blocks registration; the user can resend from the check-email page.
  try {
    await sendVerificationEmail(email, token)
  } catch (err) {
    console.error('Verification email failed (register):', err)
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
