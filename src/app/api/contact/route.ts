export const dynamic = 'force-dynamic'
import { isResponse, json, requireUser } from '@/lib/api'

// The WhatsApp number lives only in the WHATSAPP_NUMBER env var and is handed out
// to signed-in members, so it never appears in public page HTML or the repo.
export async function GET() {
  const session = await requireUser()
  if (isResponse(session)) return session
  const digits = (process.env.WHATSAPP_NUMBER ?? '').replace(/\D/g, '')
  if (!digits) return json({ whatsapp: null })
  return json({ whatsapp: `https://wa.me/${digits}` })
}
