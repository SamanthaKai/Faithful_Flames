import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  size?: number
  showText?: boolean
  className?: string
}

export function Logo({ size = 36, showText = true, className = '' }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 group ${className}`}>
      <Image
        src="/favicon.png"
        alt="Faithful Flames flame logo"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
      {showText && (
        <span className="font-heading font-bold text-xl text-primary group-hover:text-secondary transition-colors duration-200 dark:text-orange-400">
          Faithful Flames
        </span>
      )}
    </Link>
  )
}
