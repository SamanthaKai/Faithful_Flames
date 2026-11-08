export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { bool, botCheck, clientIp, fail, getSession, json, rateLimited, readBody, text } from '@/lib/api'
import { getPublishedTestimonies } from '@/lib/testimonies'
import { containsProfanity } from '@/lib/profanity'

// GET — approved testimonies only
export async function GET() {
  return json(await getPublishedTestimonies())
}

// POST { title, content, displayName?, isAnonymous?, website? }
// Open to visitors. Nothing is published until an admin approves it.
export async function POST(req: Request) {
  const body = await readBody(req)
  const blocked = botCheck(req, body)
  if (blocked) return blocked
  if (rateLimited(`testimony:${clientIp(req)}`, 3, 60 * 60_000)) {
    return fail('Thank you for sharing! Please try again a little later.', 429)
  }

  const title = text(body.title, { min: 3, max: 120 })
  if (title === null) return fail('Please give your testimony a title (3 to 120 characters).')
  const content = text(body.content, { min: 20, max: 6000 })
  if (content === null) return fail('Please write between 20 and 6,000 characters.')
  const displayName = text(body.displayName, { max: 60 })
  if (displayName === null) return fail('Please keep your name under 60 characters.')
  if (containsProfanity(title) || containsProfanity(content)) return fail('Please keep the language kind and clean.')

  const session = await getSession()
  await prisma.testimony.create({
    data: {
      userId: session?.user?.id ?? null,
      title,
      content,
      displayName: displayName || null,
      isAnonymous: bool(body.isAnonymous),
    },
  })
  return json({ ok: true }, 201)
}
