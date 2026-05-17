export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const reflections = await prisma.reflection.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { verse: { select: { reference: true } } },
  })
  return NextResponse.json(reflections)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, content, mood, verseId } = await req.json()
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Title and content required.' }, { status: 400 })
  }

  const reflection = await prisma.reflection.create({
    data: { userId: session.user.id, title, content, mood, verseId: verseId || null },
  })
  return NextResponse.json(reflection, { status: 201 })
}
