// Deterministic starfield for the night band (no randomness → no hydration mismatch).
const STARS = Array.from({ length: 46 }, (_, i) => {
  const x = (i * 73.13) % 100
  const y = (i * 37.7) % 62
  const r = i % 7 === 0 ? 1.4 : i % 3 === 0 ? 1 : 0.7
  return { x, y, r, d: `${(i % 9) * 0.45}s` }
})

export function Stars() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
      {STARS.map((s, i) => (
        <circle key={i} className="star" cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="#FFF4E8" style={{ animationDelay: s.d }} />
      ))}
    </svg>
  )
}
