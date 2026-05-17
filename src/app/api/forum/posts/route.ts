import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { containsProfanity } from '@/lib/profanity'

const RATE_LIMIT_MS = 60_000
const postTimes = new Map<string, number>()

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const topic = searchParams.get('topic')

  const posts = await prisma.forumPost.findMany({
    where: {
      isFlagged: false,
      ...(topic ? { topic: topic as never } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, image: true } },
      _count: { select: { replies: true } },
    },
    take: 50,
  })
  return NextResponse.json(posts)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = Date.now()
  const last = postTimes.get(session.user.id) ?? 0
  if (now - last < RATE_LIMIT_MS) {
    return NextResponse.json({ error: 'Please wait before posting again.' }, { status: 429 })
  }

  const { title, content, topic } = await req.json()
  if (!title?.trim() || !content?.trim() || !topic) {
    return NextResponse.json({ error: 'Missing fields.' }, { status: 400 })
  }
  if (containsProfanity(title) || containsProfanity(content)) {
    return NextResponse.json({ error: 'Content contains inappropriate language.' }, { status: 400 })
  }

  postTimes.set(session.user.id, now)

  const post = await prisma.forumPost.create({
    data: { userId: session.user.id, title, content, topic },
    include: { user: { select: { name: true, image: true } } },
  })
  return NextResponse.json(post, { status: 201 })
}
