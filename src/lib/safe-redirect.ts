/**
 * Where to send someone after sign-in. Only paths on this site are allowed
 * ("/devotions/abc#discussion"), never another website ("//evil.com",
 * "https://evil.com", "/\evil.com"), so the login link can't be used to
 * bounce members to a look-alike page.
 */
export function safeCallbackUrl(value: string | null | undefined, fallback = '/'): string {
  if (!value || typeof value !== 'string') return fallback
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback
  if (/[\u0000-\u001f]/.test(value)) return fallback
  // Don't send people back to the sign-in pages themselves.
  if (/^\/(login|register|check-email|verify-email|unverified)(\/|\?|#|$)/.test(value)) return fallback
  return value
}

/** A sign-in link that brings the member back to `path` afterwards. */
export function loginHref(path: string | null | undefined): string {
  const target = safeCallbackUrl(path, '')
  return target ? `/login?callbackUrl=${encodeURIComponent(target)}` : '/login'
}
