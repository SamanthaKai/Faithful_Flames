// ─── FILL IN YOUR CONTENT HERE ───────────────────────────────────────────────
// Each entry maps to one forum post preview card. Replace every "TODO" value
// with real content before launch. Fields:
//   title   → post headline shown on the forum listing
//   content → first 2 lines of the post body (guests see this truncated)
//   topic   → must match one of: PRAYER_REQUESTS | BIBLE_QUESTIONS | ACCOUNTABILITY | TESTIMONIES
//   user.name → display name shown as the author
//   createdAt → leave the ago() call — it keeps timestamps looking fresh
//   _count.replies → fake reply count shown on the card (set whatever looks natural)
// ─────────────────────────────────────────────────────────────────────────────

export interface SeedPost {
  id: string
  title: string
  content: string
  topic: string
  createdAt: string
  user: { name: string; image: null }
  _count: { replies: number }
  isSeed: true
}

const ago = (hours: number) =>
  new Date(Date.now() - hours * 3_600_000).toISOString()

export const FORUM_SEED_POSTS: SeedPost[] = [
  {
    id: 'seed-1',
    title: 'TODO: Post title',
    content: 'TODO: Post content — write 1–3 sentences that will show as the preview. Guests see this text truncated to 2 lines.',
    topic: 'PRAYER_REQUESTS',
    createdAt: ago(2),
    user: { name: 'TODO: Author name', image: null },
    _count: { replies: 4 },
    isSeed: true,
  },
  {
    id: 'seed-2',
    title: 'TODO: Post title',
    content: 'TODO: Post content — write 1–3 sentences that will show as the preview. Guests see this text truncated to 2 lines.',
    topic: 'BIBLE_QUESTIONS',
    createdAt: ago(7),
    user: { name: 'TODO: Author name', image: null },
    _count: { replies: 8 },
    isSeed: true,
  },
  {
    id: 'seed-3',
    title: 'TODO: Post title',
    content: 'TODO: Post content — write 1–3 sentences that will show as the preview. Guests see this text truncated to 2 lines.',
    topic: 'ACCOUNTABILITY',
    createdAt: ago(20),
    user: { name: 'TODO: Author name', image: null },
    _count: { replies: 3 },
    isSeed: true,
  },
  {
    id: 'seed-4',
    title: 'TODO: Post title',
    content: 'TODO: Post content — write 1–3 sentences that will show as the preview. Guests see this text truncated to 2 lines.',
    topic: 'TESTIMONIES',
    createdAt: ago(31),
    user: { name: 'TODO: Author name', image: null },
    _count: { replies: 11 },
    isSeed: true,
  },
  {
    id: 'seed-5',
    title: 'TODO: Post title',
    content: 'TODO: Post content — write 1–3 sentences that will show as the preview. Guests see this text truncated to 2 lines.',
    topic: 'PRAYER_REQUESTS',
    createdAt: ago(50),
    user: { name: 'TODO: Author name', image: null },
    _count: { replies: 6 },
    isSeed: true,
  },
  {
    id: 'seed-6',
    title: 'TODO: Post title',
    content: 'TODO: Post content — write 1–3 sentences that will show as the preview. Guests see this text truncated to 2 lines.',
    topic: 'BIBLE_QUESTIONS',
    createdAt: ago(72),
    user: { name: 'TODO: Author name', image: null },
    _count: { replies: 2 },
    isSeed: true,
  },
]
