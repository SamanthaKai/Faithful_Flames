export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAIL = 'kissasamantha123@gmail.com'

// Clears leftover verification tokens for the admin email so a fresh
// registration doesn't hit a duplicate-token conflict.
export async function GET() {
  await prisma.verificationToken.deleteMany({
    where: { identifier: ADMIN_EMAIL },
  })

  return NextResponse.json({ ok: true, message: `Cleared tokens for ${ADMIN_EMAIL}. You can now register fresh.` })
}
