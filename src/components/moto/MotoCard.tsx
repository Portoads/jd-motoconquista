import { Link } from 'react-router'
import { ArrowUpRight, Calendar, Gauge, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { SmartImage } from '@/components/ui/SmartImage'
import { WhatsAppIcon } from '@/components/icons'
import { useSettings } from '@/context/SettingsContext'
import { MOTO_STATUS } from '@/lib/constants'
import { formatKm, formatPrice, motoTitle } from '@/lib/format'
import type { Motorcycle } from '@/lib/types'
import { motoWhatsappMessage, whatsappLink } from '@/lib/whatsapp'

export function MotoCard({ moto }: { moto: Motorcycle }) {
  const { settings } = useSettings()
  const status = MOTO_STATUS[moto.status]
  const href = `/motos/${moto.slug}`
  const image = moto.main_image ?? moto.motorcycle_images?.[0]?.image_url ?? null
  const pageUrl = typeof window !== 'undefined' ? `${window.location.origin}${href}` : undefined
  const unavailable = moto.status === 'sold' || moto.status === 'rented'

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-graphite-200/80 bg-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-graphite-300 hover:shadow-card-hover">
      <Link to={href} className="relative block" aria-label={`Ver detalhes de ${motoTitle(moto)}`}>
        <SmartImage
          src={image ?? undefined}
          alt={`${motoTitle(moto)} — foto principal`}
          wrapperClassName="aspect-[4/3]"
          className="transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge tone={status.tone} dot className="bg-white/95">
            {status.label}
          </Badge>
          {moto.featured && <Badge tone="dark">Destaque</Badge>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-brand uppercase">{moto.brand}</p>
        <h3 className="mt-1 text-lg leading-snug font-semibold text-graphite-900">
          <Link to={href} className="hover:text-brand-700">
            {moto.model}
          </Link>
        </h3>

        <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-y border-graphite-100 py-3 text-xs text-graphite-600">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-graphite-400" aria-hidden />
            <dt className="sr-only">Ano</dt>
            <dd>{moto.year ?? '—'}</dd>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Gauge className="h-3.5 w-3.5 shrink-0 text-graphite-400" aria-hidden />
            <dt className="sr-only">Quilometragem</dt>
            <dd>{formatKm(moto.mileage)}</dd>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Tag className="h-3.5 w-3.5 shrink-0 text-graphite-400" aria-hidden />
            <dt className="sr-only">Categoria</dt>
            <dd>{moto.category ?? '—'}</dd>
          </div>
        </dl>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[0.7rem] font-medium tracking-wide text-graphite-500 uppercase">{moto.price != null ? 'Preço' : 'Valor'}</p>
            <p className="font-display text-[1.65rem] leading-none font-bold text-graphite-900">{formatPrice(moto.price)}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[auto_1fr] gap-2 pt-1">
          <Link
            to={href}
            className="inline-flex h-10 items-center justify-center gap-1 rounded-md border border-graphite-200 px-3 text-[0.82rem] font-semibold whitespace-nowrap text-graphite-900 transition-colors hover:border-graphite-900"
          >
            Ver detalhes <ArrowUpRight className="h-4 w-4" />
          </Link>
          <a
            href={whatsappLink(settings.whatsapp, motoWhatsappMessage(moto, pageUrl))}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-ink px-3 text-[0.82rem] font-semibold whitespace-nowrap text-white transition-colors hover:bg-brand"
            aria-label={`Tenho interesse em ${motoTitle(moto)}`}
          >
            <WhatsAppIcon className="h-4 w-4" /> {unavailable ? 'Consultar' : 'Tenho interesse'}
          </a>
        </div>
      </div>
    </article>
  )
}

export function MotoCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-graphite-200/80 bg-white">
      <div className="aspect-[4/3] animate-pulse bg-graphite-100" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-16 animate-pulse rounded bg-graphite-100" />
        <div className="h-5 w-2/3 animate-pulse rounded bg-graphite-100" />
        <div className="h-10 animate-pulse rounded bg-graphite-50" />
        <div className="h-7 w-1/3 animate-pulse rounded bg-graphite-100" />
      </div>
    </div>
  )
}
