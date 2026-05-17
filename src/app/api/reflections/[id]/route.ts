import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const reflection = await prisma.reflection.findUnique({ where: { id: params.id } })
  if (!reflection || reflection.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { title, content, mood, verseId } = await req.json()
  const updated = await prisma.reflection.update({
    where: { id: params.id },
    data: { title, content, mood, verseId: verseId || null },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const reflection = await prisma.reflection.findUnique({ where: { id: params.id } })
  if (!reflection || reflection.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.reflection.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
