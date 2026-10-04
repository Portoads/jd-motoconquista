import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'

export function PageHero({ eyebrow, title, description, crumbs, children }: { eyebrow?: string; title: string; description?: ReactNode; crumbs?: { label: string; to?: string }[]; children?: ReactNode }) {
  return (
    <section className="grain relative overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-[420px] w-[620px] rounded-full bg-brand/10 blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" aria-hidden />
      <div className="container-site relative py-14 sm:py-20">
        {crumbs && (
          <nav aria-label="Trilha de navegação" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-graphite-400">
            <Link to="/" className="hover:text-white">Início</Link>
            {crumbs.map((c) => (
              <span key={c.label} className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3" aria-hidden />
                {c.to ? <Link to={c.to} className="hover:text-white">{c.label}</Link> : <span className="text-graphite-200">{c.label}</span>}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <p className="eyebrow text-graphite-300">{eyebrow}</p>}
        <h1 className="display-title mt-4 max-w-4xl text-[2.6rem] sm:text-6xl lg:text-7xl">{title}</h1>
        {description && <p className="mt-5 max-w-2xl text-base leading-relaxed text-graphite-300 sm:text-lg">{description}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  )
}

export function SectionHeading({ eyebrow, title, description, align = 'left', dark, action }: { eyebrow?: string; title: string; description?: ReactNode; align?: 'left' | 'center'; dark?: boolean; action?: ReactNode }) {
  const center = align === 'center'
  return (
    <div className={center ? 'mx-auto max-w-3xl text-center' : 'flex flex-col gap-6 md:flex-row md:items-end md:justify-between'}>
      <div className={center ? '' : 'max-w-2xl'}>
        {eyebrow && <p className={`eyebrow ${dark ? 'text-graphite-300' : 'text-graphite-500'} ${center ? 'justify-center' : ''}`}>{eyebrow}</p>}
        <h2 className={`display-title mt-3 text-4xl sm:text-5xl ${dark ? 'text-white' : 'text-ink'}`}>{title}</h2>
        {description && <p className={`mt-4 text-base leading-relaxed ${dark ? 'text-graphite-300' : 'text-graphite-600'}`}>{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
