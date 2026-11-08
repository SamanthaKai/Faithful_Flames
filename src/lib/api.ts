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

export { rateLimited } from './rate-limit'

export function clientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
}

// Crawlers, headless browsers and scripted HTTP clients. Real browsers never send these.
const BOT_UA =
  /bot\b|bot\/|crawl|spider|slurp|headless|phantom|puppeteer|playwright|selenium|lighthouse|curl\/|wget|python-|httpclient|axios|node-fetch|undici|go-http|java\/|okhttp|libwww|scrapy|facebookexternalhit|preview/i

export function looksLikeBot(req: Request): boolean {
  const ua = req.headers.get('user-agent') ?? ''
  return ua.length < 10 || BOT_UA.test(ua)
}

// Forms send `startedAt` (ms timestamp of when the form appeared). People take a few
// seconds to fill a form in; scripts post instantly or without the field at all.
const MIN_FILL_MS = 2500
export function filledTooFast(startedAt: unknown): boolean {
  if (typeof startedAt !== 'number' || !Number.isFinite(startedAt)) return true
  const elapsed = Date.now() - startedAt
  return elapsed < MIN_FILL_MS || elapsed > 24 * 60 * 60_000
}

/**
 * Shared checks for public form posts. Returns a response to send back when the
 * request looks automated, or null when it may proceed. Honeypot hits get a fake
 * success so bots don't learn they were caught.
 */
export function botCheck(req: Request, body: Record<string, unknown>, fakeOk: unknown = { ok: true }): NextResponse | null {
  if (typeof body.website === 'string' && body.website) return json(fakeOk, 201)
  if (looksLikeBot(req)) return fail('Automated requests are not allowed.', 403)
  if (filledTooFast(body.startedAt)) return fail('That was quick! Please wait a moment and try again.', 400)
  return null
}
