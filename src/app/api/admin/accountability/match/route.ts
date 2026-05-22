export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'Faithful Flames <onboarding@resend.dev>'
const BASE_URL = (process.env.NEXTAUTH_URL ?? '').replace(/\/$/, '')

const FOCUS_LABELS: Record<string, string> = {
  BIBLE_READING: 'Bible Reading',
  PRAYER: 'Prayer',
  FASTING: 'Fasting',
  PURITY: 'Purity',
  WORSHIP: 'Worship',
  OTHER: 'Other',
}

const FREQUENCY_LABELS: Record<string, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  BIWEEKLY: 'Bi-weekly',
}

function matchEmail(toName: string, partnerName: string, focus: string, frequency: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f5ede0;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5ede0;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <tr>
          <td align="center" style="padding-bottom:28px;">
            <p style="margin:0;font-size:22px;font-weight:bold;color:#9B2C1D;">Faithful Flames</p>
            <p style="margin:6px 0 0;font-size:13px;color:#6B6258;">Ignite your faith. Find your people.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;border-radius:16px;padding:40px 36px;border:1px solid #e8ddd4;">
            <p style="margin:0 0 8px;font-size:20px;font-weight:bold;color:#2C2A29;">
              You have been matched with an accountability partner!
            </p>
            <p style="margin:0 0 20px;font-size:14px;color:#6B6258;line-height:1.7;">
              Hi ${toName}, we are excited to share that you have been matched with <strong>${partnerName}</strong> as your accountability partner on Faithful Flames.
            </p>
            <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;background:#faf5ee;border-radius:10px;padding:16px 20px;">
              <tr><td style="font-size:13px;color:#6B6258;padding:4px 0;"><strong>Focus area:</strong> ${FOCUS_LABELS[focus] ?? focus}</td></tr>
              <tr><td style="font-size:13px;color:#6B6258;padding:4px 0;"><strong>Check-in frequency:</strong> ${FREQUENCY_LABELS[frequency] ?? frequency}</td></tr>
            </table>
            <p style="margin:0 0 24px;font-size:14px;color:#6B6258;line-height:1.7;">
              We encourage you to reach out to your partner and introduce yourself. Pray together, hold each other accountable, and grow in faith side by side.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 0;">
              <tr>
                <td align="center" style="background:#9B2C1D;border-radius:10px;">
                  <a href="${BASE_URL}/profile" style="display:inline-block;padding:12px 32px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;">
                    View your profile
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top:24px;">
            <p style="margin:0;font-size:12px;color:#9B9390;">&ldquo;As iron sharpens iron, so one person sharpens another.&rdquo; Proverbs 27:17</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userIdA, userIdB } = await req.json()
  if (!userIdA || !userIdB || userIdA === userIdB) {
    return NextResponse.json({ error: 'Two different user IDs are required.' }, { status: 400 })
  }

  const [reqA, reqB] = await Promise.all([
    prisma.accountabilityRequest.findUnique({
      where: { userId: userIdA },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.accountabilityRequest.findUnique({
      where: { userId: userIdB },
      include: { user: { select: { name: true, email: true } } },
    }),
  ])

  if (!reqA || !reqB) {
    return NextResponse.json({ error: 'One or both users do not have pending requests.' }, { status: 404 })
  }
  if (reqA.status === 'MATCHED' || reqB.status === 'MATCHED') {
    return NextResponse.json({ error: 'One or both users are already matched.' }, { status: 409 })
  }

  await prisma.$transaction([
    prisma.accountabilityRequest.update({
      where: { userId: userIdA },
      data: { status: 'MATCHED', partnerId: userIdB },
    }),
    prisma.accountabilityRequest.update({
      where: { userId: userIdB },
      data: { status: 'MATCHED', partnerId: userIdA },
    }),
  ])

  const nameA = reqA.user.name ?? 'Friend'
  const nameB = reqB.user.name ?? 'Friend'

  await Promise.allSettled([
    resend.emails.send({
      from: FROM,
      to: reqA.user.email,
      subject: 'You have been matched with an accountability partner!',
      html: matchEmail(nameA, nameB, reqA.focus, reqA.frequency),
    }),
    resend.emails.send({
      from: FROM,
      to: reqB.user.email,
      subject: 'You have been matched with an accountability partner!',
      html: matchEmail(nameB, nameA, reqB.focus, reqB.frequency),
    }),
  ])

  return NextResponse.json({ ok: true })
}
