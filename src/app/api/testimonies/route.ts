export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const testimonies = await prisma.testimony.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true } } },
  })
  return NextResponse.json(testimonies)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content, isAnonymous } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Content required.' }, { status: 400 })

  const testimony = await prisma.testimony.create({
    data: { userId: session.user.id, content, isAnonymous: isAnonymous ?? false },
  })
  return NextResponse.json(testimony, { status: 201 })
}
