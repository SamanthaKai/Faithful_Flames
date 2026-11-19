import { PrismaAdapter } from '@auth/prisma-adapter'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { GOOGLE_SIGNIN_ENABLED } from './features'
import { findUserByEmail, normalizeEmail } from './email-address'
import { rateLimited } from './rate-limit'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    // Off unless NEXT_PUBLIC_GOOGLE_SIGNIN=true (see src/lib/features.ts).
    ...(GOOGLE_SIGNIN_ENABLED && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        const email = normalizeEmail(credentials?.email)
        if (!email || !credentials?.password) return null

        // Slow down password guessing: per network and per account.
        const fwd = req?.headers?.['x-forwarded-for']
        const ip = (typeof fwd === 'string' ? fwd.split(',')[0]?.trim() : '') || 'unknown'
        if (rateLimited(`login-ip:${ip}`, 20, 15 * 60_000) || rateLimited(`login:${email}`, 8, 15 * 60_000)) {
          throw new Error('TooManyAttempts')
        }

        const user = await findUserByEmail(email)

        if (!user?.password) return null

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null

        if (!user.emailVerified) throw new Error('EmailNotVerified')

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session: sessionData }) {
      if (user) {
        token.id = user.id
        token.authAt = Date.now()
        await prisma.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } }).catch(() => {})
      }

      // The database role is the only source of admin access (managed with
      // `npm run admin`). Re-read it at sign-in and at most once a minute after,
      // so a demotion takes effect on the server without waiting for the
      // session to expire. The same check signs out sessions of deleted
      // accounts, and sessions that began before the password was reset.
      const now = Date.now()
      if (token.id && (user || !token.roleCheckedAt || now - token.roleCheckedAt > 60_000)) {
        let dbUser: { role: string; passwordChangedAt: Date | null } | null | undefined
        try {
          dbUser = await prisma.user.findUnique({ where: { id: token.id }, select: { role: true, passwordChangedAt: true } })
        } catch {
          // Database briefly unreachable: keep the session as it was rather than
          // signing everyone out. It is checked again on the next request.
          return token
        }
        // Throwing here makes next-auth clear the session cookie (signed out).
        if (!dbUser) throw new Error('SessionRevoked: account no longer exists')
        if (dbUser.passwordChangedAt && (token.authAt ?? 0) < dbUser.passwordChangedAt.getTime()) {
          throw new Error('SessionRevoked: password was changed')
        }
        token.role = dbUser.role
        token.roleCheckedAt = now
      }
      if (trigger === 'update' && sessionData) {
        if (sessionData.name  !== undefined) token.name    = sessionData.name
        if (sessionData.image !== undefined) token.picture = sessionData.image
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id   = token.id      as string
        session.user.role = token.role    as string
        session.user.name = token.name    as string ?? session.user.name
        session.user.image = (token.picture as string | null | undefined) ?? session.user.image
      }
      return session
    },
  },
}
