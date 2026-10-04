import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Cog, Droplet, Fuel, Gauge, Palette, Share2, Tag, Zap } from 'lucide-react'
import { Seo } from '@/components/Seo'
import { Badge } from '@/components/ui/Badge'
import { LinkButton } from '@/components/ui/Button'
import { ErrorNotice, Spinner } from '@/components/ui/Feedback'
import { SmartImage } from '@/components/ui/SmartImage'
import { WhatsAppIcon } from '@/components/icons'
import { LeadForm } from '@/components/LeadForm'
import { MotoCard } from '@/components/moto/MotoCard'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/components/ui/Toast'
import { fetchMotorcycleBySlug, fetchRelatedMotorcycles } from '@/lib/api'
import { cn } from '@/lib/cn'
import { MOTO_STATUS } from '@/lib/constants'
import { formatKm, formatPrice, motoTitle } from '@/lib/format'
import type { Motorcycle } from '@/lib/types'
import { useAsync } from '@/lib/useAsync'
import { motoWhatsappMessage, whatsappLink } from '@/lib/whatsapp'
import NotFound from './NotFound'

export default function MotoDetail() {
  const { slug = '' } = useParams()
  const { data: moto, loading, error, reload } = useAsync(() => fetchMotorcycleBySlug(slug), [slug])

  if (loading) return <Spinner className="min-h-[60vh]" />
  if (error)
    return (
      <div className="container-site py-20">
        <ErrorNotice message="Não foi possível carregar esta moto." onRetry={reload} />
      </div>
    )
  if (!moto) return <NotFound title="Moto não encontrada" message="Este anúncio não existe mais ou o endereço está incorreto." />
  return <MotoView moto={moto} />
}

function MotoView({ moto }: { moto: Motorcycle }) {
  const { settings } = useSettings()
  const toast = useToast()
  const title = motoTitle(moto)
  const status = MOTO_STATUS[moto.status]
  const images = (moto.motorcycle_images ?? []).map((i) => i.image_url)
  if (images.length === 0 && moto.main_image) images.push(moto.main_image)
  const [active, setActive] = useState(0)
  useEffect(() => setActive(0), [moto.id])
  const related = useAsync(() => fetchRelatedMotorcycles(moto), [moto.id])

  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''
  const wa = whatsappLink(settings.whatsapp, motoWhatsappMessage(moto, pageUrl))
  const unavailable = moto.status === 'sold' || moto.status === 'rented'

  const specs = [
    { icon: Tag, label: 'Marca', value: moto.brand },
    { icon: Tag, label: 'Modelo', value: moto.model },
    { icon: Calendar, label: 'Ano', value: moto.year },
    { icon: Gauge, label: 'Quilometragem', value: moto.mileage != null ? formatKm(moto.mileage) : null },
    { icon: Zap, label: 'Cilindrada', value: moto.engine },
    { icon: Droplet, label: 'Categoria', value: moto.category },
    { icon: Cog, label: 'Câmbio', value: moto.transmission },
    { icon: Fuel, label: 'Combustível', value: moto.fuel },
    { icon: Palette, label: 'Cor', value: moto.color },
  ]

  const go = (d: number) => images.length && setActive((i) => (i + d + images.length) % images.length)

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title, url: pageUrl })
      else {
        await navigator.clipboard.writeText(pageUrl)
        toast('Link copiado!')
      }
    } catch {
      /* usuário cancelou */
    }
  }

  return (
    <>
      <Seo
        title={`${title} ${moto.price != null ? `— ${formatPrice(moto.price)}` : ''}`.trim()}
        description={(moto.description?.slice(0, 155) || `${title} na JD MotoConquista. ${moto.mileage != null ? formatKm(moto.mileage) + '. ' : ''}Fale com a gente pelo WhatsApp.`).trim()}
        image={images[0]}
        type="product"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: title,
          brand: { '@type': 'Brand', name: moto.brand },
          image: images,
          description: moto.description ?? undefined,
          ...(moto.price != null
            ? {
                offers: {
                  '@type': 'Offer',
                  priceCurrency: 'BRL',
                  price: moto.price,
                  availability: moto.status === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                },
              }
            : {}),
        }}
      />

      <div className="border-b border-graphite-100 bg-white">
        <div className="container-site flex items-center justify-between gap-4 py-4 text-sm">
          <Link to="/motos" className="inline-flex items-center gap-1.5 font-medium text-graphite-600 hover:text-graphite-900">
            <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
          </Link>
          <button onClick={share} className="inline-flex items-center gap-1.5 font-medium text-graphite-600 hover:text-graphite-900">
            <Share2 className="h-4 w-4" /> Compartilhar
          </button>
        </div>
      </div>

      <section className="bg-white py-8 sm:py-12">
        <div className="container-site grid gap-10 lg:grid-cols-[1.45fr_1fr] lg:gap-14">
          {/* Galeria */}
          <div className="min-w-0">
            <div className="relative overflow-hidden rounded-lg bg-graphite-100">
              <SmartImage key={images[active] ?? 'none'} src={images[active]} alt={`${title} — foto ${active + 1} de ${Math.max(images.length, 1)}`} wrapperClassName="aspect-[4/3]" loading="eager" />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge tone={status.tone} dot className="bg-white/95">{status.label}</Badge>
                {moto.featured && <Badge tone="dark">Destaque</Badge>}
              </div>
              {images.length > 1 && (
                <>
                  <button onClick={() => go(-1)} className="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow hover:bg-white" aria-label="Foto anterior">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={() => go(1)} className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow hover:bg-white" aria-label="Próxima foto">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <span className="absolute right-4 bottom-4 rounded bg-ink/75 px-2 py-1 text-xs font-medium text-white">
                    {active + 1} / {images.length}
                  </span>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Fotos">
                {images.map((src, i) => (
                  <button
                    key={src}
                    role="tab"
                    aria-selected={i === active}
                    aria-label={`Ver foto ${i + 1}`}
                    onClick={() => setActive(i)}
                    className={cn('w-20 shrink-0 overflow-hidden rounded-md ring-2 transition sm:w-24', i === active ? 'ring-brand' : 'opacity-70 ring-transparent hover:opacity-100')}
                  >
                    <SmartImage src={src} alt="" wrapperClassName="aspect-[4/3]" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Resumo */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-semibold tracking-[0.2em] text-brand uppercase">{moto.brand}</p>
            <h1 className="display-title mt-2 text-4xl text-ink sm:text-5xl">{moto.model}</h1>
            <p className="mt-2 text-sm text-graphite-500">
              {[moto.year, moto.mileage != null ? formatKm(moto.mileage) : null, moto.category].filter(Boolean).join(' · ')}
            </p>

            <div className="mt-6 rounded-lg border border-graphite-200 p-5">
              <p className="text-xs font-medium tracking-wide text-graphite-500 uppercase">{moto.price != null ? 'Preço' : 'Valor'}</p>
              <p className="font-display text-5xl leading-tight font-bold text-ink">{formatPrice(moto.price)}</p>
              {moto.price == null && <p className="text-sm text-graphite-500">Consulte o valor e as condições pelo WhatsApp.</p>}
              <LinkButton to={wa} size="lg" className="mt-5 w-full" icon={<WhatsAppIcon className="h-5 w-5" />}>
                {unavailable ? 'Consultar opções parecidas' : 'Tenho interesse nessa moto'}
              </LinkButton>
              <a href="#interesse" className="mt-3 block text-center text-sm font-medium text-graphite-600 underline-offset-4 hover:text-graphite-900 hover:underline">
                Prefere que a gente entre em contato?
              </a>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-graphite-200 bg-graphite-200">
              {specs.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 bg-white p-4">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-graphite-400" aria-hidden />
                  <div className="min-w-0">
                    <dt className="text-[0.7rem] font-medium tracking-wide text-graphite-500 uppercase">{label}</dt>
                    <dd className="mt-0.5 truncate text-sm font-semibold text-graphite-900">{value || '—'}</dd>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3 bg-white p-4">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" aria-hidden />
                <div>
                  <dt className="text-[0.7rem] font-medium tracking-wide text-graphite-500 uppercase">Status</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-graphite-900">{status.label}</dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-white pb-16">
        <div className="container-site grid gap-10 lg:grid-cols-[1.45fr_1fr] lg:gap-14">
          <div>
            <h2 className="text-xl font-semibold text-graphite-900">Descrição</h2>
            {moto.description ? (
              <p className="mt-4 leading-relaxed whitespace-pre-line text-graphite-600">{moto.description}</p>
            ) : (
              <p className="mt-4 text-graphite-500">Mais informações sobre esta moto pelo WhatsApp.</p>
            )}
          </div>
          <div id="interesse" className="scroll-mt-24 rounded-lg border border-graphite-200 bg-graphite-50 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-graphite-900">Quero receber contato</h2>
            <p className="mt-1 mb-5 text-sm text-graphite-500">Deixe seus dados e a JD MotoConquista retorna para você.</p>
            <LeadForm
              source="moto"
              motorcycleId={moto.id}
              defaultSubject={`Interesse: ${title}`}
              subjectLocked
              whatsappContext={`Tenho interesse na moto ${title}.`}
              className="sm:grid-cols-1"
            />
          </div>
        </div>
      </section>

      {related.data && related.data.length > 0 && (
        <section className="border-t border-graphite-100 bg-graphite-50 py-16">
          <div className="container-site">
            <h2 className="display-title text-3xl text-ink sm:text-4xl">Você também pode gostar</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.data.map((m) => <MotoCard key={m.id} moto={m} />)}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
