export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(req: Request) {
  const { name, email, password } = await req.json()

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: 'Invalid input.' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email already in use.' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 12)
  const isAdmin = email === process.env.ADMIN_EMAIL

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: isAdmin ? 'ADMIN' : 'USER',
      // emailVerified is intentionally null until the user clicks the link
    },
  })

  // Generate a 32-byte hex token and store it with a 24-hour expiry.
  // deleteMany first so re-registrations never leave stale tokens.
  const token = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await prisma.verificationToken.deleteMany({ where: { identifier: email } })
  await prisma.verificationToken.create({ data: { identifier: email, token, expires } })

  // Email failure never blocks registration — user can resend from check-email page.
  try {
    await sendVerificationEmail(email, token)
  } catch {
    // swallow
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
