export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.verse.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const verse = await prisma.verse.update({
    where: { id: params.id },
    data: {
      ...(body.isDaily !== undefined ? { isDaily: body.isDaily } : {}),
      ...(body.reference !== undefined ? { reference: body.reference } : {}),
      ...(body.text !== undefined ? { text: body.text } : {}),
      ...(body.reflection !== undefined ? { reflection: body.reflection } : {}),
      ...(body.tags !== undefined ? { tags: body.tags } : {}),
    },
  })
  return NextResponse.json(verse)
}
