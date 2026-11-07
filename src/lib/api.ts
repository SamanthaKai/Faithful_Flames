import { NextResponse } from 'next/server'
import { getServerSession, type Session } from 'next-auth'
import { authOptions } from './auth'

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export function fail(error: string, status = 400) {
  return NextResponse.json({ error }, { status })
}

export async function getSession(): Promise<Session | null> {
  return getServerSession(authOptions)
}

export async function requireUser(): Promise<Session | NextResponse> {
  const session = await getSession()
  if (!session?.user?.id) return fail('Please sign in first.', 401)
  return session
}

export async function requireAdmin(): Promise<Session | NextResponse> {
  const session = await getSession()
  if (!session?.user?.id) return fail('Please sign in first.', 401)
  if (session.user.role !== 'ADMIN') return fail('Forbidden', 403)
  return session
}

export const isResponse = (v: unknown): v is NextResponse => v instanceof NextResponse

/** Parse a JSON body; returns {} for missing or malformed bodies. */
export async function readBody(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json()
    return body && typeof body === 'object' && !Array.isArray(body) ? body : {}
  } catch {
    return {}
  }
}

/** Trimmed string within bounds, or null when invalid. Empty optional strings become ''. */
export function text(value: unknown, { min = 0, max }: { min?: number; max: number }): string | null {
  if (value === undefined || value === null) return min === 0 ? '' : null
  if (typeof value !== 'string') return null
  const t = value.trim()
  if (t.length < min || t.length > max) return null
  return t
}

export const bool = (v: unknown) => v === true

// Best-effort, per-instance rate limiting for public forms. On serverless this
// resets between cold starts, so it slows down abuse rather than preventing it.
const hits = new Map<string, number[]>()
export function rateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  if (recent.length >= limit) {
    hits.set(key, recent)
    return true
  }
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > 5000) hits.clear()
  return false
}

export function clientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
}
