export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'

// ─── Shared HTML shell ────────────────────────────────────────────────────────

interface PageConfig {
  title: string
  icon: string
  heading: string
  body: string
  linkHref: string
  linkLabel: string
  accentColor: string
}

function page(status: number, cfg: PageConfig): Response {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${cfg.title} — Faithful Flames</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0; padding: 0;
      background: #f5ede0;
      font-family: Georgia, 'Times New Roman', serif;
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
    }
    .wrap { padding: 40px 16px; width: 100%; display: flex; justify-content: center; }
    .card {
      background: #ffffff;
      border-radius: 18px;
      padding: 52px 44px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      border: 1px solid #e8ddd4;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    }
    .brand { font-size: 13px; font-weight: bold; color: #9B2C1D; letter-spacing: 0.6px; margin-bottom: 36px; text-transform: uppercase; }
    .icon { font-size: 52px; margin-bottom: 20px; }
    h1 { margin: 0 0 14px; font-size: 26px; color: #2C2A29; font-weight: bold; }
    p { margin: 0 0 28px; font-size: 15px; color: #6B6258; line-height: 1.7; }
    a {
      display: inline-block;
      padding: 13px 36px;
      background: ${cfg.accentColor};
      color: #ffffff;
      text-decoration: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.2px;
      transition: opacity .15s;
    }
    a:hover { opacity: 0.88; }
    .footnote { margin-top: 28px; font-size: 12px; color: #9B9390; font-style: italic; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="brand">Faithful Flames</div>
      <div class="icon">${cfg.icon}</div>
      <h1>${cfg.heading}</h1>
      <p>${cfg.body}</p>
      <a href="${cfg.linkHref}">${cfg.linkLabel}</a>
      <p class="footnote">&ldquo;The Lord himself goes before you and will be with you.&rdquo; &mdash; Deuteronomy 31:8</p>
    </div>
  </div>
</body>
</html>`

  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

// ─── GET /api/auth/verify-email?token=<token> ─────────────────────────────────

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  // Case 1 — no token in URL
  if (!token) {
    return page(400, {
      title: 'Invalid Link',
      icon: '🔗',
      heading: 'Invalid Link',
      body: 'This verification link is missing its token. Please use the exact link from your email, or request a new one.',
      linkHref: '/login',
      linkLabel: 'Back to sign in',
      accentColor: '#6B6258',
    })
  }

  // Case 2 — token not found (invalid or already used)
  const record = await prisma.verificationToken.findUnique({ where: { token } })
  if (!record) {
    return page(400, {
      title: 'Link Not Found',
      icon: '🚫',
      heading: 'Link Not Found',
      body: 'This verification link is invalid or has already been used. If you still need to verify your account, you can request a fresh link from the sign-in page.',
      linkHref: '/login',
      linkLabel: 'Back to sign in',
      accentColor: '#6B6258',
    })
  }

  const user = await prisma.user.findUnique({ where: { email: record.identifier } })

  // Case 3 — user already verified (clean up stale token)
  if (user?.emailVerified) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {})
    return page(200, {
      title: 'Already Verified',
      icon: '✅',
      heading: 'Already Verified',
      body: 'Your email address is already verified. You can sign in and join the community.',
      linkHref: '/login',
      linkLabel: 'Sign in',
      accentColor: '#9B2C1D',
    })
  }

  // Case 4 — token expired
  if (new Date() > record.expires) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {})
    return page(400, {
      title: 'Link Expired',
      icon: '⏰',
      heading: 'Link Expired',
      body: 'This verification link expired (links are valid for 24&nbsp;hours). Request a new one from the sign-in page — it only takes a moment.',
      linkHref: '/login',
      linkLabel: 'Request a new link',
      accentColor: '#6B6258',
    })
  }

  // Case 5 — success: mark verified, delete token (single-use)
  if (user) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.delete({ where: { token } }),
    ])
  }

  return page(200, {
    title: 'Email Verified!',
    icon: '🔥',
    heading: 'Email Verified!',
    body: 'Welcome to Faithful Flames! Your account is now active. Sign in and join the community &mdash; your story matters here.',
    linkHref: '/login',
    linkLabel: 'Sign in to your account',
    accentColor: '#9B2C1D',
  })
}
