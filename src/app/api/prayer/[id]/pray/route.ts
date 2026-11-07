export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { fail, isResponse, json, requireUser } from '@/lib/api'
import { PUBLIC_PRAYER_WHERE } from '@/lib/prayer'

// POST — "I prayed for this". Idempotent; only for requests on the public wall.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireUser()
  if (isResponse(session)) return session

  const request = await prisma.prayerRequest.findFirst({ where: { id: params.id, ...PUBLIC_PRAYER_WHERE }, select: { id: true } })
  if (!request) return fail('Prayer request not found.', 404)

  await prisma.prayerRequestPrayer.upsert({
    where: { userId_requestId: { userId: session.user.id, requestId: request.id } },
    create: { userId: session.user.id, requestId: request.id },
    update: {},
  })
  const prayedCount = await prisma.prayerRequestPrayer.count({ where: { requestId: request.id } })
  return json({ hasPrayed: true, prayedCount })
}
