import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  // Not logged in → send to login with callbackUrl
  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', req.url)
    return NextResponse.redirect(loginUrl)
  }

  // Logged in but email not verified → send to /unverified
  if (!token.emailVerified) {
    return NextResponse.redirect(new URL('/unverified', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/forum/:path*',
    '/reflections/:path*',
    '/testimonies/:path*',
    '/profile/:path*',
  ],
}
