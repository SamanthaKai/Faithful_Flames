import { Resend } from 'resend'
import nodemailer from 'nodemailer'

// Two ways to send:
//  1. Gmail (free, no domain needed): set GMAIL_USER and GMAIL_APP_PASSWORD.
//     Used whenever both are set. Gmail allows about 500 emails a day.
//  2. Resend: needs RESEND_API_KEY and a verified domain in RESEND_FROM_EMAIL.
//     Without a verified domain it only delivers to the Resend account's own email.
const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '')
const useGmail = !!(GMAIL_USER && GMAIL_APP_PASSWORD)

const FROM = useGmail
  ? `Faithful Flames <${GMAIL_USER}>`
  : process.env.RESEND_FROM_EMAIL ?? 'Faithful Flames <onboarding@resend.dev>'

async function send(to: string, subject: string, html: string) {
  if (useGmail) {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    })
    await transport.sendMail({ from: FROM, to, subject, html })
    return
  }
  // Resend reports failures in the result rather than throwing, so surface them.
  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({ from: FROM, to, subject, html })
  if (error) throw new Error(`Resend: ${error.message}`)
}

// On the live site, always link to the main production address. Preview URLs
// (e.g. ...-git-main-...vercel.app) sit behind Vercel login, so links there fail.
const BASE_URL = (
  process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.NEXTAUTH_URL ?? ''
).replace(/\/$/, '')

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${BASE_URL}/api/auth/verify-email?token=${token}`

  await send(
    email,
    'Verify your Faithful Flames account',
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background:#f5ede0;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5ede0;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <p style="margin:0;font-size:22px;font-weight:bold;color:#9B2C1D;letter-spacing:0.5px;">
                Faithful Flames
              </p>
              <p style="margin:6px 0 0;font-size:13px;color:#6B6258;">
                Ignite your faith. Find your people.
              </p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;padding:40px 36px;border:1px solid #e8ddd4;">

              <p style="margin:0 0 8px;font-size:20px;font-weight:bold;color:#2C2A29;">
                Verify your email address
              </p>
              <p style="margin:0 0 28px;font-size:14px;color:#6B6258;line-height:1.7;">
                Welcome to Faithful Flames! Click the button below to verify your
                email and activate your account. This link expires in&nbsp;24&nbsp;hours.
              </p>

              <!-- Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  <td align="center" style="background:#9B2C1D;border-radius:10px;">
                    <a href="${verifyUrl}"
                       style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">
                      Verify my email
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:0 0 4px;font-size:12px;color:#9B9390;text-align:center;">
                Button not working? Copy and paste this link:
              </p>
              <p style="margin:0;font-size:11px;color:#C85C17;text-align:center;word-break:break-all;">
                ${verifyUrl}
              </p>

            </td>
          </tr>

          <!-- Footer note -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#9B9390;text-align:center;">
                If you didn&rsquo;t create an account, you can safely ignore this email.
              </p>
              <p style="margin:10px 0 0;font-size:11px;color:#b8a898;font-style:italic;text-align:center;">
                &ldquo;For our God is a consuming fire.&rdquo; Hebrews 12:29
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  )
}
