export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, favoriteVerse: true, bio: true, createdAt: true, role: true },
  })
  return NextResponse.json(user)
}

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  await prisma.user.delete({ where: { id: session.user.id } })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, favoriteVerse, bio, image } = await req.json()
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name, favoriteVerse, bio, ...(image !== undefined ? { image: image || null } : {}) },
    select: { id: true, name: true, email: true, image: true, favoriteVerse: true, bio: true, createdAt: true },
  })
  return NextResponse.json(user)
}
