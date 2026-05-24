export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      createdAt: true,
      role: true,
      emailVerified: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(users)
}
