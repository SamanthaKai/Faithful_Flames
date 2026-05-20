export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const reply = await prisma.forumReply.findUnique({ where: { id: params.id } })
  if (!reply) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (session.user.id !== reply.userId && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.forumReply.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
