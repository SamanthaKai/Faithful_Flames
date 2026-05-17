import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const verses = await prisma.verse.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(verses)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const verse = await prisma.verse.create({
    data: {
      reference: body.reference,
      text: body.text,
      reflection: body.reflection,
      tags: body.tags ?? [],
      isDaily: body.isDaily ?? false,
    },
  })
  return NextResponse.json(verse, { status: 201 })
}
