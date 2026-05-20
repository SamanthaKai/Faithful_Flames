'use client'

const PARTICLES = [
  { left: '8%',  delay: '0s',    duration: '7s'   },
  { left: '18%', delay: '1.5s',  duration: '8s'   },
  { left: '30%', delay: '0.8s',  duration: '6.5s' },
  { left: '43%', delay: '2.2s',  duration: '9s'   },
  { left: '55%', delay: '0.3s',  duration: '7.5s' },
  { left: '67%', delay: '1.8s',  duration: '8.5s' },
  { left: '78%', delay: '1.1s',  duration: '6s'   },
  { left: '88%', delay: '2.7s',  duration: '7.8s' },
]

export function EmberParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute bottom-[12%] w-1 h-1 rounded-full bg-ember animate-ember-drift"
          style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration }}
        />
      ))}
    </div>
  )
}
