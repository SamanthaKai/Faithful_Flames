'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

interface TimeGreetingProps {
  firstName: string
}

export function TimeGreeting({ firstName }: TimeGreetingProps) {
  const [greeting, setGreeting] = useState('')
  const [hour, setHour] = useState<number | null>(null)

  useEffect(() => {
    const h = new Date().getHours()
    setHour(h)
    if (h < 12) setGreeting('Good morning')
    else if (h < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  if (!greeting) return null

  return (
    <div>
      <p className="text-lm-muted dark:text-[#BFAEA3] text-sm font-medium mb-1 flex items-center gap-1.5">
        {hour !== null && hour < 17
          ? <Sun className="w-3.5 h-3.5" />
          : <Moon className="w-3.5 h-3.5" />}
        {greeting}
      </p>
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-lm-text dark:text-[#FFF4E8]">{firstName}</h1>
      <p className="text-lm-muted dark:text-[#BFAEA3] mt-1.5 text-sm">How has your walk with God been today?</p>
    </div>
  )
}
