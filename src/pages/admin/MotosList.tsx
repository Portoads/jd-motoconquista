import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Bike, ExternalLink, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react'
import { Button, LinkButton } from '@/components/ui/Button'
import { EmptyState, ErrorNotice, Spinner } from '@/components/ui/Feedback'
import { Input, Select } from '@/components/ui/Field'
import { ConfirmDialog } from '@/components/ui/Modal'
import { SmartImage } from '@/components/ui/SmartImage'
import { useToast } from '@/components/ui/Toast'
import { deleteMotorcycle, fetchMotorcycles, updateMotorcycle } from '@/lib/api'
import { cn } from '@/lib/cn'
import { MOTO_STATUS } from '@/lib/constants'
import { formatKm, formatPrice, motoTitle } from '@/lib/format'
import type { Motorcycle, MotoStatus } from '@/lib/types'
import { useAsync } from '@/lib/useAsync'
import { AdminPageHeader } from './AdminLayout'

export default function MotosList() {
  const toast = useToast()
  const { data, loading, error, reload, setData } = useAsync(fetchMotorcycles, [])
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [toDelete, setToDelete] = useState<Motorcycle | null>(null)
  const [deleting, setDeleting] = useState(false)
  const status = (params.get('status') ?? '') as MotoStatus | ''

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return (data ?? []).filter(
      (m) => (!status || m.status === status) && (!term || `${m.brand} ${m.model} ${m.year ?? ''} ${m.slug}`.toLowerCase().includes(term)),
    )
  }, [data, q, status])

  const patchLocal = (id: string, patch: Partial<Motorcycle>) => setData((prev) => (prev ?? []).map((m) => (m.id === id ? { ...m, ...patch } : m)))

  async function changeStatus(m: Motorcycle, s: MotoStatus) {
    const old = m.status
    patchLocal(m.id, { status: s })
    try {
      await updateMotorcycle(m.id, { status: s })
      toast(`Status alterado para “${MOTO_STATUS[s].label}”.`)
    } catch (e) {
      patchLocal(m.id, { status: old })
      toast(e instanceof Error ? e.message : 'Erro ao alterar status.', 'error')
    }
  }

  async function toggleFeatured(m: Motorcycle) {
    patchLocal(m.id, { featured: !m.featured })
    try {
      await updateMotorcycle(m.id, { featured: !m.featured })
      toast(m.featured ? 'Removida dos destaques.' : 'Moto destacada na home.')
    } catch (e) {
      patchLocal(m.id, { featured: m.featured })
      toast(e instanceof Error ? e.message : 'Erro ao atualizar destaque.', 'error')
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteMotorcycle(toDelete)
      setData((prev) => (prev ?? []).filter((m) => m.id !== toDelete.id))
      toast('Moto excluída.')
      setToDelete(null)
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Erro ao excluir.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Motos"
        description={data ? `${data.length} ${data.length === 1 ? 'moto cadastrada' : 'motos cadastradas'}` : undefined}
        actions={<LinkButton to="/admin/motos/nova" icon={<Plus className="h-4 w-4" />}>Nova moto</LinkButton>}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-graphite-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por marca, modelo ou ano" className="pl-10" aria-label="Buscar motos" />
        </div>
        <Select
          className="sm:w-52"
          aria-label="Filtrar por status"
          value={status}
          onChange={(e) => {
            const next = new URLSearchParams(params)
            if (e.target.value) next.set('status', e.target.value)
            else next.delete('status')
            setParams(next, { replace: true })
          }}
        >
          <option value="">Todos os status</option>
          {(Object.keys(MOTO_STATUS) as MotoStatus[]).map((s) => (
            <option key={s} value={s}>{MOTO_STATUS[s].label}</option>
          ))}
        </Select>
      </div>

      {error ? (
        <ErrorNotice message={error} onRetry={reload} />
      ) : loading ? (
        <Spinner />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<Bike className="h-6 w-6 text-brand" />}
          title={data?.length ? 'Nenhuma moto encontrada' : 'Nenhuma moto cadastrada'}
          description={data?.length ? 'Ajuste a busca ou o filtro de status.' : 'Cadastre a primeira moto para ela aparecer no catálogo do site.'}
          action={!data?.length && <LinkButton to="/admin/motos/nova" icon={<Plus className="h-4 w-4" />}>Cadastrar moto</LinkButton>}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-graphite-200 bg-white">
          <ul className="divide-y divide-graphite-100">
            {list.map((m) => (
              <li key={m.id} className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
                <Link to={`/admin/motos/${m.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                  <SmartImage src={m.main_image ?? undefined} alt="" wrapperClassName="h-16 w-20 shrink-0 rounded-md" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-graphite-900">{motoTitle(m)}</p>
                    <p className="truncate text-sm text-graphite-500">
                      {formatPrice(m.price)} · {formatKm(m.mileage)} · {(m.motorcycle_images ?? []).length} foto(s)
                    </p>
                  </div>
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    aria-label={`Status de ${motoTitle(m)}`}
                    value={m.status}
                    onChange={(e) => changeStatus(m, e.target.value as MotoStatus)}
                    className="h-9 w-40 text-sm"
                  >
                    {(Object.keys(MOTO_STATUS) as MotoStatus[]).map((s) => (
                      <option key={s} value={s}>{MOTO_STATUS[s].label}</option>
                    ))}
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn('h-9 w-9', m.featured && 'border-amber-300 bg-amber-50 text-amber-600')}
                    onClick={() => toggleFeatured(m)}
                    aria-label={m.featured ? 'Remover destaque' : 'Destacar'}
                    title={m.featured ? 'Remover destaque' : 'Destacar na home'}
                  >
                    <Star className="h-4 w-4" fill={m.featured ? 'currentColor' : 'none'} />
                  </Button>
                  <LinkButton to={`/admin/motos/${m.id}`} variant="outline" size="icon" className="h-9 w-9" aria-label="Editar" title="Editar">
                    <Pencil className="h-4 w-4" />
                  </LinkButton>
                  <a href={`/motos/${m.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-graphite-200 text-graphite-700 hover:border-graphite-900" aria-label="Ver no site" title="Ver no site">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <Button variant="danger" size="icon" className="h-9 w-9" onClick={() => setToDelete(m)} aria-label="Excluir" title="Excluir">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Excluir moto"
        danger
        loading={deleting}
        confirmLabel="Excluir"
        message={<>Tem certeza que deseja excluir <strong>{toDelete && motoTitle(toDelete)}</strong>? As fotos também serão removidas. Esta ação não pode ser desfeita.</>}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}
