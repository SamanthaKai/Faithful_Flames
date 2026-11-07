export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { isResponse, json, requireAdmin } from '@/lib/api'

export async function GET() {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  const testimonies = await prisma.testimony.findMany({
    orderBy: { createdAt: 'desc' },
    take: 300,
    include: { user: { select: { name: true, email: true } } },
  })
  return json(testimonies)
}
