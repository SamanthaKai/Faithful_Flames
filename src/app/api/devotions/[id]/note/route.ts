export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { fail, isResponse, json, readBody, requireUser, text } from '@/lib/api'
import { getVisibleDevotion } from '@/lib/devotions'

// Private personal notes: every query is scoped to the signed-in user.

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireUser()
  if (isResponse(session)) return session
  const note = await prisma.reflection.findFirst({
    where: { userId: session.user.id, devotionId: params.id },
    select: { id: true, content: true, updatedAt: true },
  })
  return json(note)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await requireUser()
  if (isResponse(session)) return session
  const devotion = await getVisibleDevotion(params.id)
  if (!devotion) return fail('Devotion not found.', 404)

  const content = text((await readBody(req)).content, { min: 1, max: 10_000 })
  if (content === null) return fail('Your note must be between 1 and 10,000 characters.')

  const existing = await prisma.reflection.findFirst({
    where: { userId: session.user.id, devotionId: devotion.id },
    select: { id: true },
  })
  const note = existing
    ? await prisma.reflection.update({ where: { id: existing.id }, data: { content }, select: { id: true, content: true, updatedAt: true } })
    : await prisma.reflection.create({
        data: { userId: session.user.id, devotionId: devotion.id, title: devotion.title, content },
        select: { id: true, content: true, updatedAt: true },
      })
  return json(note)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireUser()
  if (isResponse(session)) return session
  await prisma.reflection.deleteMany({ where: { userId: session.user.id, devotionId: params.id } })
  return json({ ok: true })
}
