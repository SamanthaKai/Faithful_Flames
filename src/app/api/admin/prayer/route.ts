export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { isResponse, json, requireAdmin } from '@/lib/api'

// Admin only: every request, including private ones.
export async function GET() {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  const requests = await prisma.prayerRequest.findMany({
    orderBy: { createdAt: 'desc' },
    take: 300,
    include: { user: { select: { email: true, name: true } }, _count: { select: { prayers: true } } },
  })
  return json(requests)
}
