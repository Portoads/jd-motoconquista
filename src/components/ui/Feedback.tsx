import type { ReactNode } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Spinner({ className, label = 'Carregando…' }: { className?: string; label?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-3 py-16 text-sm text-graphite-500', className)} role="status">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      <span>{label}</span>
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  dark,
}: {
  icon?: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
  dark?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-lg border border-dashed px-6 py-14 text-center',
        dark ? 'border-white/15 text-white' : 'border-graphite-200 bg-graphite-50/60',
        className,
      )}
    >
      {icon && (
        <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-full', dark ? 'bg-white/10' : 'bg-white shadow-card')}>
          {icon}
        </div>
      )}
      <h3 className={cn('text-lg font-semibold', dark ? 'text-white' : 'text-graphite-900')}>{title}</h3>
      {description && <p className={cn('mt-2 max-w-md text-sm leading-relaxed', dark ? 'text-graphite-300' : 'text-graphite-500')}>{description}</p>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  )
}

export function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-brand/25 bg-brand-50 p-4 text-sm text-brand-700 sm:flex-row sm:items-center">
      <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
      <p className="flex-1">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="font-semibold underline underline-offset-4">
          Tentar novamente
        </button>
      )}
    </div>
  )
}
