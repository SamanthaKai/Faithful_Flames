/**
 * Manage Faithful Flames admin accounts. Admin access comes only from User.role in the database.
 *
 *   npm run admin -- list                  show every admin
 *   npm run admin -- create <email>        create a dedicated admin login (asks for name + password)
 *   npm run admin -- password <email>      set a new password for an admin (asks for it)
 *   npm run admin -- demote <email>        turn an admin back into a normal member (account is kept)
 *   npm run admin -- delete-members        permanently delete every non-admin account (asks first)
 *
 * Runs against whatever DATABASE_URL is in your environment / .env — normally production.
 * Passwords are typed into the terminal (hidden) and never stored in code or logs.
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import readline from 'node:readline'

const prisma = new PrismaClient()

// One shared reader for the whole run (separate readers lose buffered input).
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: !!process.stdin.isTTY })
let muted = false
const rlOut = rl as unknown as { _writeToOutput: (s: string) => void; output: NodeJS.WriteStream }
const originalWrite = rlOut._writeToOutput.bind(rl)
rlOut._writeToOutput = (s: string) => { if (!muted) originalWrite(s) } // hide typed passwords

// Queue lines so nothing is lost whether input is typed or piped in all at once.
const lines: string[] = []
const waiting: ((line: string | null) => void)[] = []
let closed = false
rl.on('line', (l) => { const w = waiting.shift(); if (w) w(l); else lines.push(l) })
rl.on('close', () => { closed = true; while (waiting.length) waiting.shift()!(null) })

async function ask(question: string, hidden = false): Promise<string> {
  process.stdout.write(question)
  muted = hidden
  const line = lines.length ? lines.shift()! : closed ? null : await new Promise<string | null>((r) => waiting.push(r))
  muted = false
  if (hidden || !process.stdin.isTTY) process.stdout.write('\n')
  if (line === null) { console.log('No input — cancelled.'); await prisma.$disconnect(); process.exit(1) }
  return line.trim()
}

async function askNewPassword(): Promise<string> {
  for (;;) {
    const pw = await ask('New password (min 12 characters): ', true)
    if (pw.length < 12) { console.log('  Too short — use at least 12 characters.'); continue }
    const again = await ask('Repeat password: ', true)
    if (pw !== again) { console.log('  Passwords did not match. Try again.'); continue }
    return pw
  }
}

const host = () => {
  try { return new URL(process.env.DATABASE_URL ?? '').host } catch { return '(DATABASE_URL not set)' }
}

async function confirmTarget() {
  const ok = await ask(`Database: ${host()}\nContinue? (yes/no): `)
  if (ok.toLowerCase() !== 'yes') { console.log('Cancelled.'); rl.close(); await prisma.$disconnect(); process.exit(0) }
}

async function list() {
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { email: true, name: true, createdAt: true } })
  console.log(`Admins on ${host()}:`)
  if (!admins.length) console.log('  (none)')
  for (const a of admins) console.log(`  ${a.email}  ${a.name ?? ''}  since ${a.createdAt.toISOString().slice(0, 10)}`)
}

async function create(email: string) {
  await confirmTarget()
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`An account for ${email} already exists (role: ${existing.role}).`)
    const yn = await ask('Make it an admin and set a new password? (yes/no): ')
    if (yn.toLowerCase() !== 'yes') return
    const password = await bcrypt.hash(await askNewPassword(), 12)
    await prisma.user.update({ where: { email }, data: { role: 'ADMIN', password, emailVerified: existing.emailVerified ?? new Date() } })
  } else {
    const name = (await ask('Display name (e.g. Faithful Flames Team): ')) || 'Faithful Flames Team'
    const password = await bcrypt.hash(await askNewPassword(), 12)
    await prisma.user.create({ data: { email, name, password, role: 'ADMIN', emailVerified: new Date() } })
  }
  console.log(`✔ ${email} is an admin. Sign in at /login with this email and password.`)
}

async function setPassword(email: string) {
  await confirmTarget()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.role !== 'ADMIN') { console.log(`${email} is not an admin.`); return }
  const password = await bcrypt.hash(await askNewPassword(), 12)
  await prisma.user.update({ where: { email }, data: { password } })
  console.log(`✔ Password updated for ${email}.`)
}

async function demote(email: string) {
  await confirmTarget()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) { console.log(`No account for ${email}.`); return }
  if (user.role !== 'ADMIN') { console.log(`${email} is already a normal member.`); return }
  const others = await prisma.user.count({ where: { role: 'ADMIN', email: { not: email } } })
  if (others === 0) { console.log('Refusing: this is the last admin. Create the new admin first.'); return }
  await prisma.user.update({ where: { email }, data: { role: 'USER' } })
  console.log(`✔ ${email} is now a normal member (account, notes and comments kept). Admin access ends within a minute.`)
}

// Permanently deletes every non-admin account. Shows what will go, then needs a typed confirmation.
async function deleteMembers() {
  await confirmTarget()
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { email: true } })
  if (admins.length === 0) { console.log('Refusing: there is no admin account, so nobody could sign in afterwards.'); return }
  const members = await prisma.user.findMany({ where: { role: { not: 'ADMIN' } }, select: { id: true, email: true } })
  if (members.length === 0) { console.log('There are no member accounts to delete.'); return }
  const ids = members.map((m) => m.id)
  const mine = { userId: { in: ids } }

  const [testimonies, approvedTestimonies, comments, notes, bookmarks, journal, forumPosts, prayerRequests] = await Promise.all([
    prisma.testimony.count({ where: mine }),
    prisma.testimony.count({ where: { ...mine, isApproved: true } }),
    prisma.comment.count({ where: mine }),
    prisma.reflection.count({ where: mine }),
    prisma.bookmark.count({ where: mine }),
    prisma.journalEntry.count({ where: mine }),
    prisma.forumPost.count({ where: mine }),
    prisma.prayerRequest.count({ where: mine }),
  ])

  console.log(`\nKeeping ${admins.length} admin account(s): ${admins.map((a) => a.email).join(', ')}`)
  console.log(`\nAbout to DELETE ${members.length} member account(s) and everything they own:`)
  console.log(`  comments ${comments} · private notes/reflections ${notes} · bookmarks ${bookmarks} · journal entries ${journal} · old forum posts ${forumPosts}`)
  console.log(`  testimonies ${testimonies} (${approvedTestimonies} published)`)
  console.log(`  Their ${prayerRequests} prayer request(s) are kept, just no longer linked to an account.`)
  console.log('  Articles they wrote are kept.')

  let keepTestimonies = false
  if (testimonies > 0) {
    keepTestimonies = (await ask('\nKeep their testimonies on the site (shown with the name they gave, or anonymous)? (yes/no): ')).toLowerCase() === 'yes'
  }

  const phrase = `delete ${members.length} members`
  const typed = await ask(`\nThis cannot be undone. Type "${phrase}" to continue: `)
  if (typed !== phrase) { console.log('Cancelled. Nothing was deleted.'); return }

  await prisma.$transaction(async (tx) => {
    if (keepTestimonies) {
      // Keep the name they chose, falling back to their account name, before unlinking.
      const ts = await tx.testimony.findMany({ where: mine, select: { id: true, displayName: true, isAnonymous: true, user: { select: { name: true } } } })
      for (const t of ts) {
        await tx.testimony.update({
          where: { id: t.id },
          data: { userId: null, displayName: t.isAnonymous ? t.displayName : (t.displayName || t.user?.name || null) },
        })
      }
    }
    // Replies (by admins) pointing at members' comments/replies would block the delete; detach them.
    await tx.comment.updateMany({ where: { parent: { userId: { in: ids } } }, data: { parentId: null } })
    await tx.forumReply.updateMany({ where: { parent: { userId: { in: ids } } }, data: { parentId: null } })
    await tx.verificationToken.deleteMany({ where: { identifier: { in: members.map((m) => m.email) } } })
    await tx.user.deleteMany({ where: { id: { in: ids } } })
  }, { timeout: 60_000 })

  console.log(`\n✔ Deleted ${members.length} member account(s).${keepTestimonies ? ' Their testimonies were kept.' : ''}`)
}

async function main() {
  const [cmd, rawEmail] = process.argv.slice(2)
  const email = rawEmail?.trim().toLowerCase()
  if (cmd === 'list') return list()
  if (cmd === 'delete-members') return deleteMembers()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.log('Usage: npm run admin -- <list | delete-members | create <email> | password <email> | demote <email>>')
    process.exit(1)
  }
  if (cmd === 'create') return create(email)
  if (cmd === 'password') return setPassword(email)
  if (cmd === 'demote') return demote(email)
  console.log(`Unknown command "${cmd}".`)
  process.exit(1)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => { rl.close(); return prisma.$disconnect() })
