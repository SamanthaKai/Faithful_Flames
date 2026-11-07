export const dynamic = 'force-dynamic'
import { json } from '@/lib/api'
import { getVisibleDevotions } from '@/lib/devotions'

// Public: published devotions whose Kampala day has arrived.
export async function GET() {
  return json(await getVisibleDevotions())
}
