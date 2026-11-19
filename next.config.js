const isDev = process.env.NODE_ENV !== 'production'

// Content-Security-Policy: the browser only runs scripts, loads images and
// connects to places on this site. Next.js needs inline scripts and styles to
// start the page; 'unsafe-eval' is only for the dev server's hot reload.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.googleusercontent.com",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  // Older browsers: never show this site inside another site's frame (clickjacking).
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Other sites only learn "faithfulflames…" was the referrer, never the page path.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    // Only Google profile photos. (A wildcard here would let anyone use the
    // site's image optimiser, and its quota, to fetch any image on the web.)
    remotePatterns: [{ protocol: 'https', hostname: '*.googleusercontent.com' }],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  // Retired modules: keep old links working by sending them somewhere sensible.
  async redirects() {
    return [
      { source: '/forum', destination: '/devotions', permanent: false },
      { source: '/forum/:path*', destination: '/devotions', permanent: false },
      { source: '/verses', destination: '/devotions', permanent: false },
      { source: '/community', destination: '/', permanent: false },
      { source: '/members', destination: '/', permanent: false },
      { source: '/members/:path*', destination: '/', permanent: false },
      { source: '/journal', destination: '/profile', permanent: false },
      { source: '/reflections', destination: '/profile', permanent: false },
    ]
  },
}

module.exports = nextConfig
