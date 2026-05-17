# 🔥 Faithful Flames

### *Ignite your faith. Find your people.*

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748)](https://www.prisma.io/)

---

## 📖 About

**Faithful Flames** is a Christian community platform built for young Christians (teens to young adults) to meet, grow in faith, and access meaningful content. Think of it as a digital campfire where faith comes alive through:

- ✝️ Daily verses with reflections
- 📝 Articles and devotions
- 🙏 Public testimonies
- 📔 Private journaling (Reflections)
- 💬 Community forum for prayer requests and Bible discussions

---

## 🎨 Brand Colors

| Role | Color | Hex |
| :--- | :--- | :--- |
| Primary (Fire) | Burnt Red | `#9B2C1D` |
| Secondary (Ember) | Burnt Orange | `#C85C17` |
| Background | Warm Cream | `#FDF6EC` |
| Text | Charcoal | `#2C2A29` |
| Dark Mode BG | Deep Dark | `#1A1515` |

> *"The spirit like a flame"* — Acts 2:3

---

## 🚀 Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js (Google + Email) |
| Deployment | Vercel / Railway |

---

## ✨ Features

### For Users
- 🔐 Google or email sign-up
- 👤 Profile with favorite verse
- 📖 Read verses, articles, devotions
- ✍️ Submit testimonies (moderated)
- 📔 Write private reflections/journal
- 💬 Participate in forum discussions
- 🌓 Dark mode toggle

### For Admin (Me)
- 📊 Dashboard at `/admin`
- ➕ Create/edit verses, articles, devotions
- ✅ Approve or reject testimonies
- 🚨 Moderate flagged forum posts
- 📅 Manage community events

---

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL (or use Railway/Vercel Postgres)

### Setup

```bash
# Clone the repository
git clone https://github.com/SamanthaKai/Faithful_Flames.git
cd Faithful_Flames

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and AUTH_SECRET

# Set up database
npx prisma migrate dev --name init
npx prisma db seed

# Run the dev server
npm run dev