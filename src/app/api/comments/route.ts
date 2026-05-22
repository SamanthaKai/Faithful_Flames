import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ContentType } from '@prisma/client'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const contentType = searchParams.get('contentType') as ContentType | null
  const contentId = searchParams.get('contentId')
  if (!contentType || !contentId) return NextResponse.json([])

  const comments = await prisma.comment.findMany({
    where: { contentType, contentId },
    include: { user: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(comments)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { contentType, contentId, content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })

  const comment = await prisma.comment.create({
    data: { userId: session.user.id, contentType, contentId, content: content.trim() },
    include: { user: { select: { id: true, name: true, image: true } } },
  })
  return NextResponse.json(comment)
}
