export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  try {
    const [count, record] = await Promise.all([
      prisma.prayerRecord.count({ where: { postId: params.id } }),
      session?.user
        ? prisma.prayerRecord.findUnique({
            where: { userId_postId: { userId: session.user.id, postId: params.id } },
          })
        : Promise.resolve(null),
    ])
    return NextResponse.json({ hasPrayed: !!record, prayerCount: count })
  } catch {
    return NextResponse.json({ hasPrayed: false, prayerCount: 0 })
  }
}

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const post = await prisma.forumPost.findUnique({
      where: { id: params.id },
      select: { id: true },
    })
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const existing = await prisma.prayerRecord.findUnique({
      where: { userId_postId: { userId: session.user.id, postId: params.id } },
    })

    if (!existing) {
      await prisma.prayerRecord.create({
        data: { userId: session.user.id, postId: params.id },
      })
    }

    const count = await prisma.prayerRecord.count({ where: { postId: params.id } })
    return NextResponse.json({ hasPrayed: true, prayerCount: count })
  } catch {
    return NextResponse.json({ error: 'Prayer tracking not yet available.' }, { status: 503 })
  }
}
