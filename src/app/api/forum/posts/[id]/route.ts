export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const post = await prisma.forumPost.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, image: true } },
      replies: {
        where: { isFlagged: false, parentId: null },
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { name: true, image: true } },
          children: {
            where: { isFlagged: false },
            orderBy: { createdAt: 'asc' },
            include: { user: { select: { name: true, image: true } } },
          },
        },
      },
    },
  })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(post)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const post = await prisma.forumPost.findUnique({ where: { id: params.id } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Owner or admin editing title/content
  if ((body.title !== undefined || body.content !== undefined) &&
      (session.user.id === post.userId || session.user.role === 'ADMIN')) {
    const updated = await prisma.forumPost.update({
      where: { id: params.id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.content !== undefined ? { content: body.content } : {}),
      },
    })
    return NextResponse.json(updated)
  }

  // Anyone flagging a post they don't own
  if (body.isFlagged === true && session.user.id !== post.userId) {
    await prisma.forumPost.update({ where: { id: params.id }, data: { isFlagged: true } })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const post = await prisma.forumPost.findUnique({ where: { id: params.id } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (session.user.id !== post.userId && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.forumPost.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
