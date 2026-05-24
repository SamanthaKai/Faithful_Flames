export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const article = await prisma.article.update({
    where: { id: params.id },
    data: {
      ...(body.title    !== undefined ? { title: body.title }       : {}),
      ...(body.content  !== undefined ? { content: body.content }   : {}),
      ...(body.category !== undefined ? { category: body.category } : {}),
    },
  })
  return NextResponse.json(article)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.article.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
