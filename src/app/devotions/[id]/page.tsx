export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getVisibleDevotion } from '@/lib/devotions'
import { DevotionView } from '@/components/DevotionView'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const d = await getVisibleDevotion(params.id)
  return { title: d?.title ?? 'Devotion', description: d ? `${d.scripture}: ${d.teaching.slice(0, 150)}` : undefined }
}

export default async function DevotionPage({ params }: { params: { id: string } }) {
  const devotion = await getVisibleDevotion(params.id)
  if (!devotion) notFound()
  return <DevotionView devotion={devotion} />
}
