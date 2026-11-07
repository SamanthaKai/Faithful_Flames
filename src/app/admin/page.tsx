export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/api'
import { todayKey } from '@/lib/day'
import { AdminDashboard } from './AdminDashboard'

export const metadata: Metadata = { title: 'Admin', robots: { index: false } }

export default async function AdminPage() {
  const session = await getSession()
  if (!session?.user?.id) redirect('/login?callbackUrl=/admin')
  if (session.user.role !== 'ADMIN') redirect('/')
  return <AdminDashboard today={todayKey()} />
}
