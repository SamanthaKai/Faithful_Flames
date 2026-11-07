import { PrismaAdapter } from '@auth/prisma-adapter'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { GOOGLE_SIGNIN_ENABLED } from './features'

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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

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
      if (user) token.id = user.id

      // The database role is the only source of admin access (managed with
      // `npm run admin`). Re-read it at sign-in and at most once a minute after,
      // so a demotion takes effect on the server without waiting for the
      // session to expire.
      const now = Date.now()
      if (token.id && (user || !token.roleCheckedAt || now - token.roleCheckedAt > 60_000)) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id }, select: { role: true } })
        token.role = dbUser?.role ?? 'USER'
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
