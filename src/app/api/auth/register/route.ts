export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
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

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: isAdmin ? 'ADMIN' : 'USER',
      emailVerified: null,
    },
  })

  // Clear any old tokens then create a fresh one
  await prisma.verificationToken.deleteMany({ where: { identifier: email } })
  const token = randomUUID()
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  })

  try {
    await sendVerificationEmail(email, token)
  } catch {
    // Email failed — clean up and tell the user
    await prisma.verificationToken.deleteMany({ where: { identifier: email } })
    await prisma.user.delete({ where: { id: user.id } })
    return NextResponse.json(
      { error: 'Could not send verification email. Make sure RESEND_API_KEY is set in Vercel.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
