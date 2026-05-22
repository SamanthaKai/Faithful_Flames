export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { containsProfanity } from '@/lib/profanity'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const reply = await prisma.forumReply.findUnique({ where: { id: params.id } })
  if (!reply) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (session.user.id !== reply.userId && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Content required.' }, { status: 400 })
  if (containsProfanity(content)) {
    return NextResponse.json({ error: 'Content contains inappropriate language.' }, { status: 400 })
  }

  const updated = await prisma.forumReply.update({
    where: { id: params.id },
    data: { content },
    include: { user: { select: { name: true } } },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const reply = await prisma.forumReply.findUnique({ where: { id: params.id } })
  if (!reply) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (session.user.id !== reply.userId && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // delete children first (NoAction prevents cascade at DB level)
  await prisma.forumReply.deleteMany({ where: { parentId: params.id } })
  await prisma.forumReply.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
