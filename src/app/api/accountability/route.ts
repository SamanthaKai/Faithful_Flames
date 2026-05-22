export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const request = await prisma.accountabilityRequest.findUnique({
    where: { userId: session.user.id },
    include: { partner: { select: { name: true, email: true } } },
  })
  return NextResponse.json(request ?? null)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await prisma.accountabilityRequest.findUnique({
    where: { userId: session.user.id },
  })
  if (existing) {
    return NextResponse.json({ error: 'You already have an accountability request.' }, { status: 409 })
  }

  const { focus, frequency, notes } = await req.json()
  if (!focus || !frequency) {
    return NextResponse.json({ error: 'Focus and frequency are required.' }, { status: 400 })
  }

  const request = await prisma.accountabilityRequest.create({
    data: { userId: session.user.id, focus, frequency, notes: notes ?? null },
  })
  return NextResponse.json(request, { status: 201 })
}

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.accountabilityRequest.deleteMany({ where: { userId: session.user.id } })
  return NextResponse.json({ ok: true })
}
