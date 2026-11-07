export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { fail, isResponse, json, readBody, requireAdmin } from '@/lib/api'

// PATCH { action: 'approve' | 'reject' | 'pending' }
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  const { action } = await readBody(req)
  const data =
    action === 'approve' ? { isApproved: true, reviewedAt: new Date() }
    : action === 'reject' ? { isApproved: false, reviewedAt: new Date() }
    : action === 'pending' ? { isApproved: false, reviewedAt: null }
    : null
  if (!data) return fail('Invalid action.')
  const exists = await prisma.testimony.count({ where: { id: params.id } })
  if (!exists) return fail('Not found.', 404)
  return json(await prisma.testimony.update({ where: { id: params.id }, data }))
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  await prisma.testimony.deleteMany({ where: { id: params.id } })
  return json({ ok: true })
}
