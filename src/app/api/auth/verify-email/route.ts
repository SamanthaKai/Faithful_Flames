export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'

// Email verification has been removed. Any old verification links redirect home.
export async function GET(req: Request) {
  return NextResponse.redirect(new URL('/', req.url))
}
