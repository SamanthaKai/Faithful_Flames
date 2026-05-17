export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAIL = 'kissasamantha123@gmail.com'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }

  if (session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.user.update({
    where: { email: ADMIN_EMAIL },
    data: { role: 'ADMIN' },
  })

  return NextResponse.json({ ok: true, message: `${ADMIN_EMAIL} is now ADMIN. Sign out and back in.` })
}
