import { createHash, randomBytes } from 'crypto'
import { prisma } from './prisma'

export const RESET_TTL_MS = 60 * 60_000 // 1 hour

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

/** Creates a single-use reset token for the user; any older unused ones stop working. */
export async function createResetToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString('hex')
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId } }),
    prisma.passwordResetToken.create({
      data: { userId, tokenHash: hashToken(token), expires: new Date(Date.now() + RESET_TTL_MS) },
    }),
  ])
  return token
}

/** The token's record if it can still be used, otherwise null. */
export async function findUsableToken(token: unknown) {
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return null
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } })
  if (!record || record.usedAt || record.expires < new Date()) return null
  return record
}
