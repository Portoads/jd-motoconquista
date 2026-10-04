import { Link } from 'react-router'
import { useSettings } from '@/context/SettingsContext'
import { cn } from '@/lib/cn'

/** Logotipo: usa a logo enviada no painel ou a marca tipográfica padrão. */
export function Logo({ light = true, className, compact }: { light?: boolean; className?: string; compact?: boolean }) {
  const { settings } = useSettings()
  return (
    <Link to="/" className={cn('group inline-flex items-center gap-2.5', className)} aria-label={`${settings.company_name} — início`}>
      {settings.logo_url ? (
        <img src={settings.logo_url} alt={settings.company_name} className="h-9 w-auto max-w-[180px] object-contain sm:h-10" />
      ) : (
        <>
          <span className="flex h-9 w-9 items-center justify-center rounded-[5px] bg-brand font-display text-lg font-bold tracking-tight text-white sm:h-10 sm:w-10 sm:text-xl">
            JD
          </span>
          {!compact && (
            <span className="flex flex-col leading-none">
              <span className={cn('font-display text-[1.15rem] font-bold tracking-[0.06em] uppercase sm:text-[1.3rem]', light ? 'text-white' : 'text-ink')}>
                Moto<span className="text-brand">Conquista</span>
              </span>
              <span className={cn('mt-0.5 text-[0.58rem] font-medium tracking-[0.32em] uppercase', light ? 'text-graphite-400' : 'text-graphite-500')}>
                JD · Paraíba
              </span>
            </span>
          )}
        </>
      )}
    </Link>
  )
}
