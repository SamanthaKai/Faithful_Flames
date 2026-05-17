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

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: isAdmin ? 'ADMIN' : 'USER',
      emailVerified: null,
    },
  })

  const token = randomUUID()
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  })

  await sendVerificationEmail(email, token)

  return NextResponse.json({ ok: true }, { status: 201 })
}
