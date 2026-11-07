/**
 * Manage Faithful Flames admin accounts. Admin access comes only from User.role in the database.
 *
 *   npm run admin -- list                  show every admin
 *   npm run admin -- create <email>        create a dedicated admin login (asks for name + password)
 *   npm run admin -- password <email>      set a new password for an admin (asks for it)
 *   npm run admin -- demote <email>        turn an admin back into a normal member (account is kept)
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

async function main() {
  const [cmd, rawEmail] = process.argv.slice(2)
  const email = rawEmail?.trim().toLowerCase()
  if (cmd === 'list') return list()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.log('Usage: npm run admin -- <list | create <email> | password <email> | demote <email>>')
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
