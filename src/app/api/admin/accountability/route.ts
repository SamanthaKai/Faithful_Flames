export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [pending, matched] = await Promise.all([
    prisma.accountabilityRequest.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.accountabilityRequest.findMany({
      where: { status: 'MATCHED' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        partner: { select: { id: true, name: true, email: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
  ])

  return NextResponse.json({ pending, matched })
}
