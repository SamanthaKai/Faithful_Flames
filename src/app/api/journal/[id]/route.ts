export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getOwnedEntry(id: string, userId: string) {
  const entry = await prisma.journalEntry.findUnique({ where: { id } })
  if (!entry) return { error: 'Not found', status: 404 }
  if (entry.userId !== userId) return { error: 'Forbidden', status: 403 }
  return { entry }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await getOwnedEntry(params.id, session.user.id)
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status })

  const { title, content, status } = await req.json()
  const updated = await prisma.journalEntry.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(content !== undefined ? { content } : {}),
      ...(status !== undefined ? { status } : {}),
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await getOwnedEntry(params.id, session.user.id)
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status })

  await prisma.journalEntry.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
