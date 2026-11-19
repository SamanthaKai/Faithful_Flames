const BLOCKED = [
  // "hell", "damn" and "ass" are deliberately not here: they appear in Scripture
  // and in honest testimony ("saved from hell", Balaam's ass). Reports and
  // moderators handle misuse.
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'crap',
  'piss', 'cock', 'dick', 'pussy', 'whore', 'slut',
  'cunt', 'nigger', 'faggot', 'retard',
]

export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase().replace(/[^a-z\s]/g, '')
  return BLOCKED.some((word) => lower.split(/\s+/).includes(word))
}
