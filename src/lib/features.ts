// Feature switches. NEXT_PUBLIC_ values are baked in at build time, so change
// them in Vercel and redeploy.

/** Google sign-in is off until NEXT_PUBLIC_GOOGLE_SIGNIN=true (plus Google client keys). */
export const GOOGLE_SIGNIN_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_SIGNIN === 'true'
