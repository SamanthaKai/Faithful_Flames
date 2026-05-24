export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
  })
  return NextResponse.json(articles)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const article = await prisma.article.create({
    data: {
      title: body.title,
      content: body.content,
      category: body.category,
      isPublished: true,
      authorId: session.user.id,
    },
  })
  return NextResponse.json(article, { status: 201 })
}
