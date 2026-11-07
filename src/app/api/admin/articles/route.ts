export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { isResponse, json, requireAdmin } from '@/lib/api'

export async function GET() {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  return json(await prisma.article.findMany({ orderBy: { publishedAt: 'desc' } }))
}
