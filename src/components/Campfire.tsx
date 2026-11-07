// The Faithful Flames campfire: crossed logs, a ring of stones, layered flames.
// Pure SVG + CSS (see .flame / .fire-glow in globals.css); respects reduced motion.

export function Campfire({ className = '', lit = true }: { className?: string; lit?: boolean }) {
  return (
    <svg viewBox="0 0 320 260" className={className} role="img" aria-label={lit ? 'A lit campfire' : 'A campfire burned down to embers'}>
      <defs>
        <radialGradient id="cf-glow" cx="50%" cy="70%" r="50%">
          <stop offset="0%" stopColor="#FF7A29" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#A63B1E" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#A63B1E" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cf-outer" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#A63B1E" />
          <stop offset="45%" stopColor="#FF7A29" />
          <stop offset="100%" stopColor="#F6B25E" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="cf-mid" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#FF7A29" />
          <stop offset="100%" stopColor="#FFD08A" />
        </linearGradient>
        <linearGradient id="cf-log" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6B3B22" />
          <stop offset="100%" stopColor="#3A1F12" />
        </linearGradient>
      </defs>

      <ellipse className={lit ? 'fire-glow' : ''} cx="160" cy="190" rx="150" ry="80" fill="url(#cf-glow)" opacity={lit ? 1 : 0.35} />

      {lit && (
        <g>
          <path className="flame" fill="url(#cf-outer)"
            d="M160 40 C 178 78, 214 96, 206 146 C 202 172, 186 194, 160 196 C 132 194, 114 172, 112 146 C 108 112, 140 98, 146 70 C 150 92, 160 98, 160 40 Z" />
          <path className="flame flame-mid" fill="url(#cf-mid)" opacity="0.95"
            d="M162 86 C 174 110, 194 124, 188 154 C 184 174, 174 188, 160 189 C 144 188, 132 174, 132 156 C 132 134, 150 124, 152 104 C 156 118, 162 120, 162 86 Z" />
          <path className="flame flame-core" fill="#FFF4E8" opacity="0.9"
            d="M160 128 C 168 142, 176 152, 172 168 C 170 178, 166 184, 160 184 C 152 184, 147 177, 148 167 C 149 155, 158 148, 160 128 Z" />
        </g>
      )}

      {/* logs */}
      <g>
        <rect x="88" y="186" width="150" height="20" rx="10" fill="url(#cf-log)" transform="rotate(-14 163 196)" />
        <rect x="84" y="186" width="150" height="20" rx="10" fill="url(#cf-log)" transform="rotate(14 159 196)" />
        <circle cx="92" cy="214" r="7" fill="#8A5634" />
        <circle cx="92" cy="214" r="3.5" fill="#5A321D" />
        <circle cx="230" cy="214" r="7" fill="#8A5634" />
        <circle cx="230" cy="214" r="3.5" fill="#5A321D" />
        {!lit && <ellipse cx="160" cy="196" rx="40" ry="8" fill="#FF7A29" opacity="0.35" />}
      </g>

      {/* stones */}
      <g fill="#2B2220" stroke="#3D302C" strokeWidth="1">
        <ellipse cx="62" cy="226" rx="18" ry="11" />
        <ellipse cx="100" cy="236" rx="20" ry="11" />
        <ellipse cx="142" cy="241" rx="19" ry="10" />
        <ellipse cx="182" cy="241" rx="19" ry="10" />
        <ellipse cx="222" cy="236" rx="20" ry="11" />
        <ellipse cx="258" cy="226" rx="18" ry="11" />
      </g>
    </svg>
  )
}

/** A tiny flame mark used inline (prayer wall, labels). */
export function Wick({ lit, className = '' }: { lit: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 20 28" className={className} aria-hidden="true">
      <path
        className={`wick ${lit ? 'lit' : ''}`}
        d="M10 2 C 13 8, 17 11, 16 17 C 15.4 21.5, 13 24, 10 24 C 6.8 24, 4.4 21.5, 4 17.5 C 3.6 12.5, 8 10.5, 8.6 6.5 C 9.4 9, 10 9.5, 10 2 Z"
        fill={lit ? '#FF7A29' : 'none'}
        stroke={lit ? '#F6B25E' : 'currentColor'}
        strokeWidth="1.3"
        opacity={lit ? 1 : 0.55}
      />
      {lit && <path d="M10 13 C 11.6 15.5, 12.6 17, 12.2 19.5 C 12 21, 11 22, 10 22 C 8.8 22, 8 21, 8 19.6 C 8 17.6, 9.6 16.5, 10 13 Z" fill="#FFF4E8" opacity="0.85" />}
    </svg>
  )
}
