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

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, favoriteVerse, bio } = await req.json()
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name, favoriteVerse, bio },
    select: { id: true, name: true, email: true, image: true, favoriteVerse: true, bio: true, createdAt: true },
  })
  return NextResponse.json(user)
}
