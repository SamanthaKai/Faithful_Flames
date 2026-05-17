# Faithful Flames

> Ignite your faith. Find your people.

A full-stack Christian community platform for young believers — built with Next.js 14, Prisma, PostgreSQL, and NextAuth.js.

---

## Features

- **Daily Verses** — scripture with reflection and tags
- **Articles** — long-form writings (admin-only authoring)
- **Devotions** — short devotional posts with prayer point and reflection question
- **Testimonies** — community stories (submitted by users, approved by admin)
- **Reflections** — private personal journaling (per user)
- **Forum** — topic-based discussion with profanity filter, rate limiting, and report button
- **Admin Panel** — manage all content at `/admin`
- **Dark mode** — system-preference aware, toggle in navbar
- **Auth** — Google OAuth + email/password via NextAuth.js

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Playfair Display + Inter fonts)
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js v4
- **Deployment:** Vercel / Railway ready

---

## Setup

### 1. Clone and install

```bash
cd "Faithful Flames"
npm install
```

### 2. Configure environment

Copy the example and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://user:password@localhost:5432/faithful_flames"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"

# Optional — needed for Google sign-in
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Your email — this account gets ADMIN role on first register
ADMIN_EMAIL="your@email.com"
```

### 3. Set up the database

```bash
npm run db:migrate    # creates tables
npm run db:generate   # generates Prisma client
npm run db:seed       # populates sample verses, articles, devotions, events
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Admin Access

1. Register with the email set in `ADMIN_EMAIL`
2. Your account is automatically granted the `ADMIN` role
3. Visit `/admin` to manage content

---

## Deployment

### Vercel

1. Push to GitHub
2. Import in Vercel
3. Add all environment variables in the Vercel dashboard
4. Set `DATABASE_URL` to your production PostgreSQL URL (e.g. Railway, Neon, Supabase)
5. Run migrations: `npx prisma migrate deploy` (as a build or post-deploy step)

### Railway

1. Create a PostgreSQL service in Railway
2. Copy the `DATABASE_URL` from Railway into your env
3. Deploy — Railway auto-detects Next.js

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── (auth)/login          # Sign-in page
│   ├── (auth)/register       # Registration page
│   ├── verses/               # Daily verses
│   ├── articles/             # Long-form articles + detail
│   ├── devotions/            # Devotional posts + detail
│   ├── testimonies/          # Community testimonies
│   ├── reflections/          # Private journaling
│   ├── forum/                # Discussion forum + thread view
│   ├── profile/              # User profile
│   ├── admin/                # Admin panel
│   └── api/                  # All API routes
├── components/
│   ├── Navbar.tsx            # Navigation + Logo
│   ├── Footer.tsx
│   ├── Logo.tsx              # favicon.png as logo
│   ├── Providers.tsx         # Session + Theme providers
│   └── ThemeProvider.tsx     # Dark mode
└── lib/
    ├── auth.ts               # NextAuth config
    ├── prisma.ts             # Prisma singleton
    └── profanity.ts          # Word filter for forum
```

---

## Scripts

| Command | Action |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio |
