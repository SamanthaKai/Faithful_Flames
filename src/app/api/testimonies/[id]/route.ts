export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const testimony = await prisma.testimony.findUnique({ where: { id: params.id } })
  if (!testimony) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (session.user.id !== testimony.userId && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Content required.' }, { status: 400 })

  const updated = await prisma.testimony.update({
    where: { id: params.id },
    data: { content },
    include: { user: { select: { name: true, id: true } } },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const testimony = await prisma.testimony.findUnique({ where: { id: params.id } })
  if (!testimony) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (session.user.id !== testimony.userId && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.testimony.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
