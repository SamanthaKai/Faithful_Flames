export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'

// Email verification has been removed.
export async function POST() {
  return NextResponse.json({ error: 'Email verification is no longer required.' }, { status: 410 })
}
