export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { json, readBody } from '@/lib/api'
import { todayKey } from '@/lib/day'

// POST { visitorId } — counts one visitor per Kampala day (random id stored in the
// visitor's browser; no personal data).
export async function POST(req: Request) {
  const { visitorId } = await readBody(req)
  if (typeof visitorId !== 'string' || !/^[a-zA-Z0-9-]{8,64}$/.test(visitorId)) return json({ ok: false }, 400)
  const day = todayKey()
  try {
    await prisma.dailyVisit.upsert({
      where: { day_visitorId: { day, visitorId } },
      create: { day, visitorId },
      update: { views: { increment: 1 } },
    })
  } catch {
    // Analytics must never break the page.
  }
  return json({ ok: true })
}
