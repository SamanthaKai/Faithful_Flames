export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { fail, isResponse, json, readBody, requireAdmin, text } from '@/lib/api'

// Admin only.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  const body = await readBody(req)
  const data: { title?: string; content?: string; category?: string; isPublished?: boolean } = {}
  if (body.title !== undefined) {
    const v = text(body.title, { min: 3, max: 160 })
    if (!v) return fail('Title must be 3 to 160 characters.')
    data.title = v
  }
  if (body.content !== undefined) {
    const v = text(body.content, { min: 20, max: 50_000 })
    if (!v) return fail('Content must be at least 20 characters.')
    data.content = v
  }
  if (body.category !== undefined) {
    const v = text(body.category, { min: 2, max: 40 })
    if (!v) return fail('Category must be 2 to 40 characters.')
    data.category = v
  }
  if (typeof body.isPublished === 'boolean') data.isPublished = body.isPublished
  const exists = await prisma.article.count({ where: { id: params.id } })
  if (!exists) return fail('Not found.', 404)
  return json(await prisma.article.update({ where: { id: params.id }, data }))
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  await prisma.bookmark.deleteMany({ where: { contentType: 'ARTICLE', contentId: params.id } })
  await prisma.article.deleteMany({ where: { id: params.id } })
  return json({ ok: true })
}
