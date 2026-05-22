import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { contentType, contentId } = await req.json()

  const existing = await prisma.like.findUnique({
    where: { userId_contentType_contentId: { userId: session.user.id, contentType, contentId } },
  })

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } })
  } else {
    await prisma.like.create({ data: { userId: session.user.id, contentType, contentId } })
  }

  const count = await prisma.like.count({ where: { contentType, contentId } })
  return NextResponse.json({ liked: !existing, count })
}
