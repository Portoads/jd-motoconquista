import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Bike, Search, SlidersHorizontal, X } from 'lucide-react'
import { Seo } from '@/components/Seo'
import { Button, LinkButton } from '@/components/ui/Button'
import { EmptyState, ErrorNotice } from '@/components/ui/Feedback'
import { Field, Input, Select } from '@/components/ui/Field'
import { WhatsAppIcon } from '@/components/icons'
import { MotoCard, MotoCardSkeleton } from '@/components/moto/MotoCard'
import { PageHero } from '@/components/sections/PageHero'
import { useSettings } from '@/context/SettingsContext'
import { fetchMotorcycles } from '@/lib/api'
import { cn } from '@/lib/cn'
import { MOTO_STATUS } from '@/lib/constants'
import type { Motorcycle, MotoStatus } from '@/lib/types'
import { useAsync } from '@/lib/useAsync'
import { whatsappLink } from '@/lib/whatsapp'

const SORTS = {
  recent: 'Mais recentes',
  price_asc: 'Menor preço',
  price_desc: 'Maior preço',
  km_asc: 'Menor quilometragem',
} as const
type SortKey = keyof typeof SORTS

const FILTER_KEYS = ['q', 'marca', 'modelo', 'categoria', 'status', 'anoMin', 'anoMax', 'precoMin', 'precoMax', 'kmMax'] as const
type FilterKey = (typeof FILTER_KEYS)[number]

function uniq(values: (string | null)[]): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v && v.trim())))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function applyFilters(list: Motorcycle[], p: URLSearchParams): Motorcycle[] {
  const num = (k: string) => {
    const v = p.get(k)
    return v !== null && v !== '' && !Number.isNaN(Number(v)) ? Number(v) : null
  }
  const q = norm(p.get('q') ?? '')
  const brand = p.get('marca')
  const model = norm(p.get('modelo') ?? '')
  const category = p.get('categoria')
  const status = p.get('status') as MotoStatus | null
  const anoMin = num('anoMin')
  const anoMax = num('anoMax')
  const precoMin = num('precoMin')
  const precoMax = num('precoMax')
  const kmMax = num('kmMax')

  const out = list.filter((m) => {
    if (q && !norm(`${m.brand} ${m.model} ${m.category ?? ''} ${m.year ?? ''} ${m.color ?? ''}`).includes(q)) return false
    if (brand && m.brand !== brand) return false
    if (model && !norm(m.model).includes(model)) return false
    if (category && m.category !== category) return false
    if (status && m.status !== status) return false
    if (anoMin !== null && (m.year ?? 0) < anoMin) return false
    if (anoMax !== null && (m.year ?? Infinity) > anoMax) return false
    if (precoMin !== null && (m.price === null || m.price < precoMin)) return false
    if (precoMax !== null && (m.price === null || m.price > precoMax)) return false
    if (kmMax !== null && (m.mileage === null || m.mileage > kmMax)) return false
    return true
  })

  const sort = (p.get('ordem') as SortKey) || 'recent'
  const nullLast = (a: number | null, b: number | null, dir: 1 | -1) => {
    if (a === null && b === null) return 0
    if (a === null) return 1
    if (b === null) return -1
    return (a - b) * dir
  }
  return out.sort((a, b) => {
    switch (sort) {
      case 'price_asc':
        return nullLast(a.price, b.price, 1)
      case 'price_desc':
        return nullLast(a.price, b.price, -1)
      case 'km_asc':
        return nullLast(a.mileage, b.mileage, 1)
      default:
        return b.created_at.localeCompare(a.created_at)
    }
  })
}

export default function Catalog() {
  const { settings } = useSettings()
  const { data, loading, error, reload } = useAsync(fetchMotorcycles, [])
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const all = useMemo(() => data ?? [], [data])
  const brands = useMemo(() => uniq(all.map((m) => m.brand)), [all])
  const categories = useMemo(() => uniq(all.map((m) => m.category)), [all])
  const results = useMemo(() => applyFilters(all, params), [all, params])
  const activeCount = FILTER_KEYS.filter((k) => k !== 'q' && params.get(k)).length

  const setParam = (k: FilterKey | 'ordem', v: string) => {
    const next = new URLSearchParams(params)
    if (v) next.set(k, v)
    else next.delete(k)
    setParams(next, { replace: true })
  }
  const clearAll = () => setParams(new URLSearchParams(params.get('ordem') ? { ordem: params.get('ordem')! } : {}), { replace: true })

  const filters = (
    <div className="space-y-5">
      <Field label="Marca">
        {(id) => (
          <Select id={id} value={params.get('marca') ?? ''} onChange={(e) => setParam('marca', e.target.value)}>
            <option value="">Todas as marcas</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </Select>
        )}
      </Field>
      <Field label="Modelo">
        {(id) => <Input id={id} value={params.get('modelo') ?? ''} onChange={(e) => setParam('modelo', e.target.value)} placeholder="Ex.: CG 160" />}
      </Field>
      <Field label="Categoria">
        {(id) => (
          <Select id={id} value={params.get('categoria') ?? ''} onChange={(e) => setParam('categoria', e.target.value)}>
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        )}
      </Field>
      <Field label="Status">
        {(id) => (
          <Select id={id} value={params.get('status') ?? ''} onChange={(e) => setParam('status', e.target.value)}>
            <option value="">Todos</option>
            {(Object.keys(MOTO_STATUS) as MotoStatus[]).map((s) => (
              <option key={s} value={s}>{MOTO_STATUS[s].label}</option>
            ))}
          </Select>
        )}
      </Field>
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-graphite-800">Ano</legend>
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" inputMode="numeric" aria-label="Ano mínimo" placeholder="De" value={params.get('anoMin') ?? ''} onChange={(e) => setParam('anoMin', e.target.value)} />
          <Input type="number" inputMode="numeric" aria-label="Ano máximo" placeholder="Até" value={params.get('anoMax') ?? ''} onChange={(e) => setParam('anoMax', e.target.value)} />
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-graphite-800">Preço (R$)</legend>
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" inputMode="numeric" min={0} aria-label="Preço mínimo" placeholder="Mín." value={params.get('precoMin') ?? ''} onChange={(e) => setParam('precoMin', e.target.value)} />
          <Input type="number" inputMode="numeric" min={0} aria-label="Preço máximo" placeholder="Máx." value={params.get('precoMax') ?? ''} onChange={(e) => setParam('precoMax', e.target.value)} />
        </div>
      </fieldset>
      <Field label="Quilometragem máxima">
        {(id) => <Input id={id} type="number" inputMode="numeric" min={0} placeholder="Ex.: 30000" value={params.get('kmMax') ?? ''} onChange={(e) => setParam('kmMax', e.target.value)} />}
      </Field>
      {activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearAll} icon={<X className="h-4 w-4" />} className="w-full">
          Limpar filtros
        </Button>
      )}
    </div>
  )

  return (
    <>
      <Seo title="Motos disponíveis" description="Catálogo de motocicletas da JD MotoConquista: filtre por marca, modelo, ano, preço, categoria e quilometragem. Atendimento online em João Pessoa e Santa Rita — PB." />
      <PageHero
        eyebrow="Catálogo"
        title="Motos disponíveis"
        description="Pesquise, filtre e compare. Gostou de alguma? Fale com a gente direto pelo WhatsApp."
        crumbs={[{ label: 'Motos' }]}
      >
        <form role="search" onSubmit={(e) => e.preventDefault()} className="relative max-w-xl">
          <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-graphite-400" aria-hidden />
          <input
            type="search"
            value={params.get('q') ?? ''}
            onChange={(e) => setParam('q', e.target.value)}
            placeholder="Buscar por marca, modelo, ano…"
            aria-label="Buscar motos"
            className="h-13 w-full rounded-md border border-white/15 bg-white/[0.06] pr-4 pl-12 text-white placeholder:text-graphite-400 focus:border-white/40 focus:bg-white/10 focus:outline-none"
          />
        </form>
      </PageHero>

      <section className="bg-graphite-50 py-10 sm:py-14">
        <div className="container-site grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Filtros desktop */}
          <aside className="hidden lg:block" aria-label="Filtros">
            <div className="sticky top-24 rounded-lg border border-graphite-200 bg-white p-6">
              <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold tracking-wide text-graphite-900 uppercase">
                <SlidersHorizontal className="h-4 w-4 text-brand" /> Filtros
              </h2>
              {filters}
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-graphite-600" aria-live="polite">
                {loading ? 'Carregando motos…' : <><strong className="text-graphite-900">{results.length}</strong> {results.length === 1 ? 'moto encontrada' : 'motos encontradas'}</>}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="lg:hidden" onClick={() => setFiltersOpen(true)} icon={<SlidersHorizontal className="h-4 w-4" />}>
                  Filtros{activeCount > 0 && <span className="ml-1 rounded bg-brand px-1.5 text-xs text-white">{activeCount}</span>}
                </Button>
                <label className="sr-only" htmlFor="ordem">Ordenar por</label>
                <Select id="ordem" className="w-auto min-w-48 flex-1 sm:flex-none" value={params.get('ordem') ?? 'recent'} onChange={(e) => setParam('ordem', e.target.value === 'recent' ? '' : e.target.value)}>
                  {(Object.keys(SORTS) as SortKey[]).map((k) => (
                    <option key={k} value={k}>{SORTS[k]}</option>
                  ))}
                </Select>
              </div>
            </div>

            {error ? (
              <ErrorNotice message="Não foi possível carregar as motos agora." onRetry={reload} />
            ) : loading ? (
              <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => <MotoCardSkeleton key={i} />)}
              </div>
            ) : all.length === 0 ? (
              <EmptyState
                icon={<Bike className="h-6 w-6 text-brand" />}
                title="Nenhuma moto anunciada no momento"
                description="Nosso estoque está sendo atualizado. Conte pelo WhatsApp qual moto você procura e avisamos quando chegar."
                action={<LinkButton to={whatsappLink(settings.whatsapp, 'Olá, JD MotoConquista! Estou procurando uma moto. Podem me ajudar?')} icon={<WhatsAppIcon className="h-4 w-4" />}>Falar no WhatsApp</LinkButton>}
              />
            ) : results.length === 0 ? (
              <EmptyState
                icon={<Search className="h-6 w-6 text-brand" />}
                title="Nenhuma moto com esses filtros"
                description="Tente remover alguns filtros ou fale com a gente: podemos ajudar a encontrar o que você procura."
                action={<Button variant="outline" onClick={() => setParams(new URLSearchParams(), { replace: true })}>Limpar busca e filtros</Button>}
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
                {results.map((m) => <MotoCard key={m.id} moto={m} />)}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filtros mobile (gaveta) */}
      <div className={cn('fixed inset-0 z-[70] lg:hidden', filtersOpen ? '' : 'pointer-events-none')} aria-hidden={!filtersOpen}>
        <div className={cn('absolute inset-0 bg-ink/60 transition-opacity', filtersOpen ? 'opacity-100' : 'opacity-0')} onClick={() => setFiltersOpen(false)} />
        <div
          role="dialog"
          aria-label="Filtros"
          className={cn('absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300', filtersOpen ? 'translate-x-0' : 'translate-x-full')}
        >
          <div className="flex items-center justify-between border-b border-graphite-100 px-5 py-4">
            <h2 className="font-semibold">Filtros</h2>
            <button onClick={() => setFiltersOpen(false)} className="rounded-md p-1.5 hover:bg-graphite-100" aria-label="Fechar filtros">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">{filters}</div>
          <div className="border-t border-graphite-100 p-4">
            <Button className="w-full" onClick={() => setFiltersOpen(false)}>
              Ver {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
