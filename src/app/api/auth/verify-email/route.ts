export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  const loginUrl = (path: string) => new URL(path, req.url)

  if (!token) {
    return NextResponse.redirect(loginUrl('/verify-email?error=missing'))
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } })

  if (!record) {
    return NextResponse.redirect(loginUrl('/verify-email?error=invalid'))
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } })
    return NextResponse.redirect(loginUrl('/verify-email?error=expired'))
  }

  await prisma.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  })

  await prisma.verificationToken.delete({ where: { token } })

  // Redirect to login so the user gets a fresh JWT that reflects emailVerified: true.
  // Also clear any existing session cookie — a stale token would still have emailVerified: false
  // and the middleware would keep bouncing them to /unverified.
  const response = NextResponse.redirect(loginUrl('/login?verified=true'))
  response.cookies.delete('next-auth.session-token')
  response.cookies.delete('__Secure-next-auth.session-token')
  return response
}
