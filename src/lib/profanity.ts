const BLOCKED = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'damn', 'crap',
  'hell', 'ass', 'piss', 'cock', 'dick', 'pussy', 'whore', 'slut',
  'cunt', 'nigger', 'faggot', 'retard',
]

export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase().replace(/[^a-z\s]/g, '')
  return BLOCKED.some((word) => lower.split(/\s+/).includes(word))
}
