'use client'

import { useState } from 'react'

export function PrayButton() {
  const [prayed, setPrayed] = useState(false)

  return (
    <button
      onClick={() => setPrayed(true)}
      disabled={prayed}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
        prayed
          ? 'bg-gold/20 text-gold border border-gold/30 shadow-[0_0_20px_rgba(246,178,94,0.25)] cursor-default'
          : 'bg-ember/10 text-ember border border-ember/20 hover:bg-ember/20 hover:shadow-[0_0_20px_rgba(255,122,41,0.2)]'
      }`}
    >
      {prayed ? '✨ Praying' : '🙏 Pray for this'}
    </button>
  )
}
