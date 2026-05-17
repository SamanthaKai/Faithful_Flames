import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.RESEND_FROM_EMAIL ?? 'Faithful Flames <onboarding@resend.dev>'
const BASE_URL = process.env.NEXTAUTH_URL?.replace(/\/$/, '') ?? ''

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${BASE_URL}/api/auth/verify-email?token=${token}`

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Verify your Faithful Flames account',
    html: `
      <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:40px 24px;background:#FDF6EC;color:#2C2A29;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="font-size:24px;font-weight:bold;color:#9B2C1D;margin:0;">Faithful Flames</h1>
          <p style="color:#6B6258;margin:8px 0 0;">Ignite your faith. Find your people.</p>
        </div>
        <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e1dc;">
          <h2 style="font-size:20px;margin:0 0 12px;color:#2C2A29;">Verify your email</h2>
          <p style="color:#6B6258;line-height:1.6;margin:0 0 24px;">
            Welcome! Click the button below to verify your email address and activate your account.
            This link expires in 24 hours.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${url}" style="background:#9B2C1D;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">
              Verify my email
            </a>
          </div>
          <p style="color:#9B9390;font-size:13px;text-align:center;margin:0;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
        <p style="text-align:center;color:#9B9390;font-size:12px;margin-top:24px;">
          &ldquo;For the fire of God is a consuming fire.&rdquo; — Hebrews 12:29
        </p>
      </div>
    `,
  })
}
