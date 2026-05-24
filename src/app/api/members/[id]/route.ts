export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === 'ADMIN'

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      createdAt: true,
      role: true,
      emailVerified: true,
    },
  })

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!user.emailVerified && !isAdmin) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const posts = await prisma.forumPost.findMany({
    where: { userId: params.id, isFlagged: false },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      title: true,
      content: true,
      topic: true,
      createdAt: true,
      _count: { select: { replies: true } },
    },
  })

  return NextResponse.json({ ...user, posts })
}
