import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type Tone = 'red' | 'green' | 'amber' | 'blue' | 'neutral' | 'dark'

const tones: Record<Tone, string> = {
  red: 'bg-brand-50 text-brand-700 ring-brand/20',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  blue: 'bg-sky-50 text-sky-800 ring-sky-600/20',
  neutral: 'bg-graphite-100 text-graphite-700 ring-graphite-300/60',
  dark: 'bg-ink/85 text-white ring-white/10 backdrop-blur',
}

export function Badge({ tone = 'neutral', children, className, dot }: { tone?: Tone; children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide uppercase ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  )
}
