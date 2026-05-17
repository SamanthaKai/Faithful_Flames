export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  if (type === 'reply') {
    await prisma.forumReply.delete({ where: { id: params.id } })
  } else {
    await prisma.forumPost.delete({ where: { id: params.id } })
  }
  return NextResponse.json({ ok: true })
}
