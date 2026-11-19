// Placeholders shown the moment someone taps a link, while the server prepares
// the page. They mirror the real layout so nothing jumps when it arrives.

const bar = 'rounded-md animate-pulse motion-reduce:animate-none'
const light = `${bar} bg-lm-border/70 dark:bg-white/[0.06]`
const onNight = `${bar} bg-white/10`

function Loading({ label }: { label: string }) {
  return <span className="sr-only" role="status">{label}</span>
}

export function DevotionSkeleton() {
  return (
    <div aria-busy="true">
      <Loading label="Loading the devotion…" />
      <header className="night relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 pb-14 pt-12 sm:px-6 md:pb-20 md:pt-16">
          <div className={`${onNight} mb-8 h-3 w-56`} />
          <div className={`${onNight} h-10 w-4/5 md:h-14`} />
          <div className={`${onNight} mt-3 h-10 w-3/5 md:h-14`} />
          <div className="mt-8 flex gap-3">
            <div className={`${onNight} h-10 w-48 !rounded-full`} />
            <div className={`${onNight} h-10 w-24 !rounded-full`} />
            <div className={`${onNight} h-10 w-24 !rounded-full`} />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-4xl space-y-14 px-4 py-14 sm:px-6 md:py-20">
        {[0, 1].map((i) => (
          <div key={i} className="grid gap-3 md:grid-cols-[88px_1fr] md:gap-8">
            <div className={`${light} h-6 w-20 md:ml-auto`} />
            <div className="space-y-3">
              <div className={`${light} h-5 w-full`} />
              <div className={`${light} h-5 w-11/12`} />
              <div className={`${light} h-5 w-4/5`} />
              {i === 1 && <div className={`${light} h-5 w-2/3`} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 md:py-20" aria-busy="true">
      <Loading label="Loading…" />
      <div className={`${light} mb-4 h-3 w-32`} />
      <div className={`${light} h-10 w-2/3 md:h-12`} />
      <div className={`${light} mt-5 h-4 w-full max-w-xl`} />
      <div className={`${light} mt-2 h-4 w-4/5 max-w-lg`} />
      <div className="mt-12 space-y-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2.5 border-b border-lm-border/70 pb-8 dark:border-ember/[0.07]">
            <div className={`${light} h-6 w-1/2`} />
            <div className={`${light} h-4 w-full`} />
            <div className={`${light} h-4 w-5/6`} />
          </div>
        ))}
      </div>
    </div>
  )
}
