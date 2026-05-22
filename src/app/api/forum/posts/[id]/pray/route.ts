export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ hasPrayed: false, prayerCount: 0 })
  }

  const [post, record] = await Promise.all([
    prisma.forumPost.findUnique({ where: { id: params.id }, select: { prayerCount: true } }),
    prisma.prayerRecord.findUnique({
      where: { userId_postId: { userId: session.user.id, postId: params.id } },
    }),
  ])

  return NextResponse.json({
    hasPrayed: !!record,
    prayerCount: post?.prayerCount ?? 0,
  })
}

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const post = await prisma.forumPost.findUnique({
    where: { id: params.id },
    select: { id: true, prayerCount: true },
  })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const existing = await prisma.prayerRecord.findUnique({
    where: { userId_postId: { userId: session.user.id, postId: params.id } },
  })
  if (existing) {
    return NextResponse.json({ hasPrayed: true, prayerCount: post.prayerCount })
  }

  const [updatedPost] = await prisma.$transaction([
    prisma.forumPost.update({
      where: { id: params.id },
      data: { prayerCount: { increment: 1 } },
      select: { prayerCount: true },
    }),
    prisma.prayerRecord.create({
      data: { userId: session.user.id, postId: params.id },
    }),
  ])

  return NextResponse.json({ hasPrayed: true, prayerCount: updatedPost.prayerCount })
}
