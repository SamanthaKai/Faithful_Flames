import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ContentType } from '@prisma/client'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  const { searchParams } = new URL(req.url)
  const contentType = searchParams.get('contentType') as ContentType | null
  const contentId = searchParams.get('contentId')
  if (!contentType || !contentId) return NextResponse.json({ count: 0, liked: false })

  const [count, userLike] = await Promise.all([
    prisma.like.count({ where: { contentType, contentId } }),
    session?.user?.id
      ? prisma.like.findUnique({
          where: { userId_contentType_contentId: { userId: session.user.id, contentType, contentId } },
        })
      : null,
  ])
  return NextResponse.json({ count, liked: !!userLike })
}
