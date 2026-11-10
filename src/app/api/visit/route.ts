export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { clientIp, getSession, json, looksLikeBot, rateLimited, readBody } from '@/lib/api'
import { todayKey } from '@/lib/day'

// POST { visitorId } — counts one visitor per Kampala day (random id stored in the
// visitor's browser; no personal data).
export async function POST(req: Request) {
  // Bots and floods are dropped quietly so they never show up in the admin numbers.
  if (looksLikeBot(req) || rateLimited(`visit:${clientIp(req)}`, 120, 10 * 60_000)) return json({ ok: true })
  const { visitorId } = await readBody(req)
  if (typeof visitorId !== 'string' || !/^[a-zA-Z0-9-]{8,64}$/.test(visitorId)) return json({ ok: false }, 400)
  const day = todayKey()
  try {
    await prisma.dailyVisit.upsert({
      where: { day_visitorId: { day, visitorId } },
      create: { day, visitorId },
      update: { views: { increment: 1 } },
    })
    // Signed-in members: remember when they were last active (for the admin's Members view).
    const session = await getSession()
    if (session?.user?.id) {
      const now = new Date()
      await prisma.user.updateMany({
        where: { id: session.user.id, OR: [{ lastSeenAt: null }, { lastSeenAt: { lt: new Date(now.getTime() - 5 * 60_000) } }] },
        data: { lastSeenAt: now },
      })
    }
  } catch {
    // Analytics must never break the page.
  }
  return json({ ok: true })
}
