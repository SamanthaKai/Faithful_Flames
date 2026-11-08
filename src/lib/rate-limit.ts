// Best-effort, per-instance rate limiting. On serverless this resets between cold
// starts, so it slows down abuse rather than preventing it.
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
