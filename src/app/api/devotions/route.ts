export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const devotions = await prisma.devotion.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
  })
  return NextResponse.json(devotions)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const devotion = await prisma.devotion.create({
    data: {
      title: body.title,
      scripture: body.scripture,
      teaching: body.teaching,
      prayerPoint: body.prayerPoint,
      reflectionQuestion: body.reflectionQuestion,
      isPublished: true,
    },
  })
  return NextResponse.json(devotion, { status: 201 })
}
