export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { containsProfanity } from '@/lib/profanity'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { postId, content } = await req.json()
  if (!postId || !content?.trim()) return NextResponse.json({ error: 'Missing fields.' }, { status: 400 })
  if (containsProfanity(content)) {
    return NextResponse.json({ error: 'Content contains inappropriate language.' }, { status: 400 })
  }

  const reply = await prisma.forumReply.create({
    data: { postId, userId: session.user.id, content },
    include: { user: { select: { name: true, image: true } } },
  })
  return NextResponse.json(reply, { status: 201 })
}
