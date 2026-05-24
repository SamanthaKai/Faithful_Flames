export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === 'ADMIN'

  const users = await prisma.user.findMany({
    where: isAdmin ? {} : { emailVerified: { not: null } },
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
