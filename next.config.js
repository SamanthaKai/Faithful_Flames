/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: '**' },
    ],
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
