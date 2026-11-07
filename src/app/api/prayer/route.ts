export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { bool, clientIp, fail, getSession, json, rateLimited, readBody, text } from '@/lib/api'
import { getPublicPrayers } from '@/lib/prayer'

// GET — public prayer wall (approved + not private + consented only)
export async function GET() {
  const session = await getSession()
  return json(await getPublicPrayers(session?.user?.id ?? null))
}

// POST { content, name?, isAnonymous?, isPrivate?, shareConsent?, website? }
// Open to visitors; signed-in members are linked to their request.
export async function POST(req: Request) {
  const body = await readBody(req)
  if (typeof body.website === 'string' && body.website) return json({ ok: true }, 201) // honeypot
  if (rateLimited(`prayer:${clientIp(req)}`, 5, 60 * 60_000)) {
    return fail('Thank you. You have sent several requests already. Please try again a little later.', 429)
  }

  const content = text(body.content, { min: 5, max: 2000 })
  if (content === null) return fail('Please share your request in 5 to 2,000 characters.')
  const name = text(body.name, { max: 60 })
  if (name === null) return fail('Please keep your name under 60 characters.')

  const isPrivate = bool(body.isPrivate)
  const isAnonymous = bool(body.isAnonymous)
  // A private request can never be shared, whatever the client sends.
  const shareConsent = !isPrivate && bool(body.shareConsent)

  const session = await getSession()
  await prisma.prayerRequest.create({
    data: {
      userId: session?.user?.id ?? null,
      name: name || session?.user?.name || null,
      content,
      isAnonymous,
      isPrivate,
      shareConsent,
    },
  })
  return json({ ok: true }, 201)
}
