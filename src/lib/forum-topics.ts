export interface ForumTopic {
  value: string
  label: string
  labelSingular: string
  icon: string
  isPrayer: boolean
  light: string
  dark: string
}

// Single source of truth for forum categories.
// To add a new topic: (1) add the enum value to prisma/schema.prisma ForumTopic,
// run a migration, then (2) add one entry here — every page updates automatically.
export const FORUM_TOPICS: ForumTopic[] = [
  {
    value: 'PRAYER_REQUESTS',
    label: 'Prayer Requests',
    labelSingular: 'Prayer Request',
    icon: '🙏',
    isPrayer: true,
    light: 'bg-amber-50 text-amber-700 border-amber-200',
    dark: 'bg-[#F6B25E]/10 text-[#F6B25E] border-[#F6B25E]/25',
  },
  {
    value: 'BIBLE_QUESTIONS',
    label: 'Bible Questions',
    labelSingular: 'Bible Question',
    icon: '📖',
    isPrayer: false,
    light: 'bg-blue-50 text-blue-700 border-blue-200',
    dark: 'bg-blue-400/10 text-blue-300 border-blue-400/25',
  },
  {
    value: 'ACCOUNTABILITY',
    label: 'Accountability',
    labelSingular: 'Accountability',
    icon: '🤝',
    isPrayer: false,
    light: 'bg-purple-50 text-purple-700 border-purple-200',
    dark: 'bg-purple-400/10 text-purple-300 border-purple-400/25',
  },
  {
    value: 'TESTIMONIES',
    label: 'Testimonies',
    labelSingular: 'Testimony',
    icon: '🔥',
    isPrayer: false,
    light: 'bg-orange-50 text-orange-700 border-orange-200',
    dark: 'bg-[#FF7A29]/10 text-[#FF7A29] border-[#FF7A29]/25',
  },
]

export const FORUM_TOPIC_MAP: Record<string, ForumTopic> = Object.fromEntries(
  FORUM_TOPICS.map((t) => [t.value, t])
)
