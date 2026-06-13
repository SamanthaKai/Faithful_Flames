'use client'

import { useState, useEffect } from 'react'

type TimeOfDay = 'morning' | 'afternoon' | 'evening'

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

function MorningSVG() {
  return (
    <svg viewBox="0 0 260 160" xmlns="http://www.w3.org/2000/svg" className="w-64 h-40" aria-hidden="true">
      {/* Sun near horizon with rays */}
      <circle cx="198" cy="82" r="26" fill="#FFBB6B" opacity="0.35" />
      <circle cx="198" cy="82" r="17" fill="#FF9F3E" opacity="0.6" />
      <line x1="198" y1="53" x2="198" y2="47" stroke="#FFBB6B" strokeWidth="2" opacity="0.45" strokeLinecap="round" />
      <line x1="222" y1="60" x2="226" y2="56" stroke="#FFBB6B" strokeWidth="2" opacity="0.45" strokeLinecap="round" />
      <line x1="229" y1="82" x2="235" y2="82" stroke="#FFBB6B" strokeWidth="2" opacity="0.45" strokeLinecap="round" />
      <line x1="174" y1="60" x2="170" y2="56" stroke="#FFBB6B" strokeWidth="2" opacity="0.45" strokeLinecap="round" />
      {/* Soft horizon glow */}
      <ellipse cx="198" cy="130" rx="90" ry="22" fill="#FFBB6B" opacity="0.10" />
      {/* Back hills */}
      <path d="M0 110 Q50 75 100 95 Q150 115 200 75 Q230 55 260 80 L260 160 L0 160 Z" fill="#8DAF6A" opacity="0.55" />
      {/* Front hills */}
      <path d="M0 140 Q60 118 120 132 Q180 146 260 122 L260 160 L0 160 Z" fill="#6D9B42" opacity="0.65" />
      {/* Plants left */}
      <line x1="20" y1="160" x2="20" y2="130" stroke="#4A7A28" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="20" cy="127" rx="5" ry="7" fill="#5E9834" opacity="0.75" />
      <line x1="20" y1="140" x2="12" y2="128" stroke="#4A7A28" strokeWidth="1" strokeLinecap="round" />
      <line x1="20" y1="138" x2="28" y2="126" stroke="#4A7A28" strokeWidth="1" strokeLinecap="round" />
      {/* Plants centre */}
      <line x1="100" y1="160" x2="100" y2="125" stroke="#4A7A28" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="100" cy="122" rx="6" ry="8" fill="#6DB240" opacity="0.85" />
      <line x1="90" y1="145" x2="82" y2="132" stroke="#4A7A28" strokeWidth="1" strokeLinecap="round" />
      <ellipse cx="80" cy="130" rx="5" ry="6" fill="#5E9834" opacity="0.65" />
      {/* Flowers */}
      <circle cx="35" cy="152" r="3" fill="#FFB347" opacity="0.75" />
      <circle cx="42" cy="148" r="2.5" fill="#FF8C42" opacity="0.65" />
      <circle cx="145" cy="145" r="3" fill="#FFD166" opacity="0.75" />
      {/* Plants right */}
      <line x1="235" y1="160" x2="235" y2="128" stroke="#4A7A28" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="235" cy="125" rx="5" ry="7" fill="#5E9834" opacity="0.85" />
      <line x1="220" y1="155" x2="212" y2="140" stroke="#4A7A28" strokeWidth="1" strokeLinecap="round" />
      <ellipse cx="210" cy="137" rx="4" ry="5" fill="#6DB240" opacity="0.65" />
    </svg>
  )
}

function AfternoonSVG() {
  return (
    <svg viewBox="0 0 260 160" xmlns="http://www.w3.org/2000/svg" className="w-64 h-40" aria-hidden="true">
      {/* Sun high in sky */}
      <circle cx="200" cy="36" r="30" fill="#FFD166" opacity="0.22" />
      <circle cx="200" cy="36" r="20" fill="#FFD166" opacity="0.38" />
      <circle cx="200" cy="36" r="13" fill="#FFA500" opacity="0.65" />
      {/* Back hills — brighter, warmer greens */}
      <path d="M0 110 Q50 75 100 95 Q150 115 200 75 Q230 55 260 80 L260 160 L0 160 Z" fill="#7EAA52" opacity="0.60" />
      {/* Front hills */}
      <path d="M0 140 Q60 118 120 132 Q180 146 260 122 L260 160 L0 160 Z" fill="#5D9136" opacity="0.70" />
      {/* Plants left */}
      <line x1="20" y1="160" x2="20" y2="130" stroke="#4A7A28" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="20" cy="127" rx="5" ry="7" fill="#5E9834" opacity="0.80" />
      <line x1="20" y1="140" x2="12" y2="128" stroke="#4A7A28" strokeWidth="1" strokeLinecap="round" />
      <line x1="20" y1="138" x2="28" y2="126" stroke="#4A7A28" strokeWidth="1" strokeLinecap="round" />
      {/* Plants centre */}
      <line x1="100" y1="160" x2="100" y2="125" stroke="#4A7A28" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="100" cy="122" rx="6" ry="8" fill="#6DB240" opacity="0.90" />
      <line x1="90" y1="145" x2="82" y2="132" stroke="#4A7A28" strokeWidth="1" strokeLinecap="round" />
      <ellipse cx="80" cy="130" rx="5" ry="6" fill="#5E9834" opacity="0.70" />
      {/* Flowers — brighter */}
      <circle cx="35" cy="152" r="3.5" fill="#FF9F3E" opacity="0.80" />
      <circle cx="42" cy="148" r="3" fill="#FFB347" opacity="0.70" />
      <circle cx="145" cy="145" r="3.5" fill="#FFD166" opacity="0.80" />
      <circle cx="155" cy="150" r="2.5" fill="#FF9F3E" opacity="0.60" />
      {/* Plants right */}
      <line x1="235" y1="160" x2="235" y2="128" stroke="#4A7A28" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="235" cy="125" rx="5" ry="7" fill="#5E9834" opacity="0.90" />
      <line x1="220" y1="155" x2="212" y2="140" stroke="#4A7A28" strokeWidth="1" strokeLinecap="round" />
      <ellipse cx="210" cy="137" rx="4" ry="5" fill="#6DB240" opacity="0.70" />
    </svg>
  )
}

function EveningSVG() {
  return (
    <svg viewBox="0 0 260 160" xmlns="http://www.w3.org/2000/svg" className="w-64 h-40" aria-hidden="true">
      {/* Stars */}
      <circle cx="28"  cy="16" r="1.5" fill="#FFF4E8" opacity="0.65" />
      <circle cx="68"  cy="9"  r="1"   fill="#FFF4E8" opacity="0.55" />
      <circle cx="128" cy="13" r="1.5" fill="#FFF4E8" opacity="0.65" />
      <circle cx="160" cy="7"  r="1"   fill="#FFF4E8" opacity="0.50" />
      <circle cx="53"  cy="28" r="1"   fill="#FFF4E8" opacity="0.45" />
      <circle cx="182" cy="20" r="1"   fill="#FFF4E8" opacity="0.55" />
      <circle cx="110" cy="22" r="0.8" fill="#FFF4E8" opacity="0.40" />
      {/* Crescent moon */}
      <path d="M222 10 A14 14 0 1 1 222 38 A10 10 0 1 0 222 10 Z" fill="#FFF4E8" opacity="0.50" />
      {/* Back hills — darker evening tones */}
      <path d="M0 110 Q50 75 100 95 Q150 115 200 75 Q230 55 260 80 L260 160 L0 160 Z" fill="#4A6B38" opacity="0.65" />
      {/* Front hills */}
      <path d="M0 140 Q60 118 120 132 Q180 146 260 122 L260 160 L0 160 Z" fill="#36512A" opacity="0.75" />
      {/* Lantern on the hillside */}
      {/* pole */}
      <line x1="119" y1="110" x2="119" y2="120" stroke="#7A5C3A" strokeWidth="1.5" strokeLinecap="round" />
      {/* body */}
      <rect x="113" y="96" width="12" height="14" rx="2" fill="#F6B25E" opacity="0.88" />
      {/* roof */}
      <path d="M111 96 L119 89 L127 96 Z" fill="#D4943A" opacity="0.88" />
      {/* flame inside */}
      <ellipse cx="119" cy="103" rx="3" ry="4" fill="#FFDD99" opacity="0.75" />
      {/* inner glow rings */}
      <ellipse cx="119" cy="103" rx="9"  ry="9"  fill="#F6B25E" opacity="0.18" />
      <ellipse cx="119" cy="103" rx="18" ry="16" fill="#FF9F3E" opacity="0.08" />
      {/* Plants left — darker */}
      <line x1="20" y1="160" x2="20" y2="130" stroke="#2E5020" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="20" cy="127" rx="5" ry="7" fill="#3A6028" opacity="0.80" />
      <line x1="20" y1="140" x2="12" y2="128" stroke="#2E5020" strokeWidth="1" strokeLinecap="round" />
      <line x1="20" y1="138" x2="28" y2="126" stroke="#2E5020" strokeWidth="1" strokeLinecap="round" />
      {/* Plants centre — darker */}
      <line x1="100" y1="160" x2="100" y2="125" stroke="#2E5020" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="100" cy="122" rx="6" ry="8" fill="#3A6028" opacity="0.85" />
      <line x1="90" y1="145" x2="82" y2="132" stroke="#2E5020" strokeWidth="1" strokeLinecap="round" />
      <ellipse cx="80" cy="130" rx="5" ry="6" fill="#2E5020" opacity="0.65" />
      {/* Firefly glows */}
      <circle cx="58"  cy="138" r="1.5" fill="#FFD166" opacity="0.55" />
      <circle cx="152" cy="130" r="1.5" fill="#FFD166" opacity="0.45" />
      <circle cx="198" cy="142" r="1"   fill="#FFD166" opacity="0.40" />
      {/* Plants right — darker */}
      <line x1="235" y1="160" x2="235" y2="128" stroke="#2E5020" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="235" cy="125" rx="5" ry="7" fill="#3A6028" opacity="0.85" />
      <line x1="220" y1="155" x2="212" y2="140" stroke="#2E5020" strokeWidth="1" strokeLinecap="round" />
      <ellipse cx="210" cy="137" rx="4" ry="5" fill="#3A6028" opacity="0.65" />
    </svg>
  )
}

export function HeroIllustration() {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay | null>(null)

  useEffect(() => {
    setTimeOfDay(getTimeOfDay(new Date().getHours()))
  }, [])

  // Placeholder matching exact SVG dimensions to prevent layout shift
  if (!timeOfDay) return <div className="w-64 h-40 hidden lg:block" aria-hidden="true" />

  const Illustration = timeOfDay === 'morning' ? MorningSVG : timeOfDay === 'afternoon' ? AfternoonSVG : EveningSVG

  return (
    <div className="hidden lg:block flex-shrink-0">
      <Illustration />
    </div>
  )
}
