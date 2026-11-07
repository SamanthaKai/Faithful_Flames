export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { fail, isResponse, json, readBody, requireAdmin } from '@/lib/api'

const STATUSES = ['PENDING', 'APPROVED', 'ARCHIVED'] as const

// PATCH { status } — APPROVED puts a request on the public wall only if the
// submitter chose to share it and did not mark it private (see PUBLIC_PRAYER_WHERE).
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  const { status } = await readBody(req)
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) return fail('Invalid status.')
  const request = await prisma.prayerRequest.findUnique({ where: { id: params.id } })
  if (!request) return fail('Not found.', 404)
  const updated = await prisma.prayerRequest.update({
    where: { id: params.id },
    data: { status: status as (typeof STATUSES)[number] },
  })
  return json(updated)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  await prisma.prayerRequest.deleteMany({ where: { id: params.id } })
  return json({ ok: true })
}
