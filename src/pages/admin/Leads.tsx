import { useMemo, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Eye, Mail, Search, Trash2, Users } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorNotice, Spinner } from '@/components/ui/Feedback'
import { Input, Select } from '@/components/ui/Field'
import { ConfirmDialog, Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { WhatsAppIcon } from '@/components/icons'
import { deleteLead, fetchLeads, updateLeadStatus } from '@/lib/api'
import { LEAD_SOURCE, LEAD_STATUS } from '@/lib/constants'
import { formatDateTime, formatPhone, motoTitle } from '@/lib/format'
import type { Lead, LeadSource, LeadStatus } from '@/lib/types'
import { useAsync } from '@/lib/useAsync'
import { whatsappLink } from '@/lib/whatsapp'
import { AdminPageHeader } from './AdminLayout'

function leadWhatsapp(l: Lead): string {
  const about = l.motorcycles ? ` sobre a moto ${motoTitle(l.motorcycles)}` : l.subject ? ` sobre "${l.subject}"` : ''
  return whatsappLink(l.phone, `Olá, ${l.name.split(' ')[0]}! Aqui é da JD MotoConquista. Recebemos seu contato pelo site${about}.`)
}

export default function Leads() {
  const toast = useToast()
  const { data, loading, error, reload, setData } = useAsync(fetchLeads, [])
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [viewing, setViewing] = useState<Lead | null>(null)
  const [toDelete, setToDelete] = useState<Lead | null>(null)
  const [deleting, setDeleting] = useState(false)
  const status = (params.get('status') ?? '') as LeadStatus | ''
  const source = (params.get('origem') ?? '') as LeadSource | ''

  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(params)
    if (v) next.set(k, v)
    else next.delete(k)
    setParams(next, { replace: true })
  }

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return (data ?? []).filter(
      (l) =>
        (!status || l.status === status) &&
        (!source || l.source === source) &&
        (!term || `${l.name} ${l.phone} ${l.email ?? ''} ${l.subject ?? ''} ${l.message ?? ''}`.toLowerCase().includes(term)),
    )
  }, [data, q, status, source])

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const l of data ?? []) c[l.status] = (c[l.status] ?? 0) + 1
    return c
  }, [data])

  async function changeStatus(l: Lead, s: LeadStatus) {
    const old = l.status
    const apply = (st: LeadStatus) => {
      setData((prev) => (prev ?? []).map((x) => (x.id === l.id ? { ...x, status: st } : x)))
      setViewing((v) => (v && v.id === l.id ? { ...v, status: st } : v))
    }
    apply(s)
    try {
      await updateLeadStatus(l.id, s)
      toast(`Lead marcado como “${LEAD_STATUS[s].label}”.`)
    } catch (e) {
      apply(old)
      toast(e instanceof Error ? e.message : 'Erro ao alterar status.', 'error')
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteLead(toDelete.id)
      setData((prev) => (prev ?? []).filter((x) => x.id !== toDelete.id))
      setViewing(null)
      setToDelete(null)
      toast('Lead excluído.')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Erro ao excluir.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <AdminPageHeader title="Leads" description="Contatos recebidos pelos formulários do site." />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <FilterChip active={!status} onClick={() => setParam('status', '')}>Todos ({data?.length ?? 0})</FilterChip>
        {(Object.keys(LEAD_STATUS) as LeadStatus[]).map((s) => (
          <FilterChip key={s} active={status === s} onClick={() => setParam('status', s)}>
            {LEAD_STATUS[s].label} ({counts[s] ?? 0})
          </FilterChip>
        ))}
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-graphite-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, telefone, e-mail ou mensagem" className="pl-10" aria-label="Buscar leads" />
        </div>
        <Select className="sm:w-60" aria-label="Filtrar por origem" value={source} onChange={(e) => setParam('origem', e.target.value)}>
          <option value="">Todas as origens</option>
          {(Object.keys(LEAD_SOURCE) as LeadSource[]).map((s) => <option key={s} value={s}>{LEAD_SOURCE[s]}</option>)}
        </Select>
      </div>

      {error ? (
        <ErrorNotice message={error} onRetry={reload} />
      ) : loading ? (
        <Spinner />
      ) : list.length === 0 ? (
        <EmptyState icon={<Users className="h-6 w-6 text-brand" />} title={data?.length ? 'Nenhum lead com esses filtros' : 'Nenhum lead recebido ainda'} description={data?.length ? 'Ajuste a busca ou os filtros.' : 'Os contatos dos formulários do site aparecerão aqui.'} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-graphite-200 bg-white">
          <div className="hidden grid-cols-[1.4fr_1.4fr_1fr_170px_150px] gap-4 border-b border-graphite-100 bg-graphite-50 px-5 py-3 text-xs font-semibold tracking-wide text-graphite-500 uppercase lg:grid">
            <span>Contato</span>
            <span>Interesse</span>
            <span>Data</span>
            <span>Status</span>
            <span className="text-right">Ações</span>
          </div>
          <ul className="divide-y divide-graphite-100">
            {list.map((l) => (
              <li key={l.id} className="grid gap-3 px-5 py-4 lg:grid-cols-[1.4fr_1.4fr_1fr_170px_150px] lg:items-center lg:gap-4">
                <div className="min-w-0">
                  <button onClick={() => setViewing(l)} className="truncate text-left font-semibold text-graphite-900 hover:text-brand-700">
                    {l.name}
                  </button>
                  <p className="truncate text-sm text-graphite-500">{formatPhone(l.phone)}{l.email ? ` · ${l.email}` : ''}</p>
                </div>
                <div className="min-w-0 text-sm">
                  <p className="truncate text-graphite-800">{l.motorcycles ? motoTitle(l.motorcycles) : l.subject || '—'}</p>
                  <p className="truncate text-xs text-graphite-500">{LEAD_SOURCE[l.source]}</p>
                </div>
                <p className="text-sm text-graphite-500">{formatDateTime(l.created_at)}</p>
                <Select aria-label={`Status do lead ${l.name}`} value={l.status} onChange={(e) => changeStatus(l, e.target.value as LeadStatus)} className="h-9 text-sm">
                  {(Object.keys(LEAD_STATUS) as LeadStatus[]).map((s) => <option key={s} value={s}>{LEAD_STATUS[s].label}</option>)}
                </Select>
                <div className="flex gap-2 lg:justify-end">
                  <a href={leadWhatsapp(l)} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#1fae5b] text-white hover:bg-[#178f4a]" aria-label="Abrir WhatsApp" title="Abrir WhatsApp">
                    <WhatsAppIcon className="h-4 w-4" />
                  </a>
                  <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setViewing(l)} aria-label="Ver detalhes" title="Ver detalhes"><Eye className="h-4 w-4" /></Button>
                  <Button variant="danger" size="icon" className="h-9 w-9" onClick={() => setToDelete(l)} aria-label="Excluir" title="Excluir"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Detalhes do lead"
        footer={
          viewing && (
            <>
              <Button variant="danger" onClick={() => setToDelete(viewing)} icon={<Trash2 className="h-4 w-4" />}>Excluir</Button>
              {viewing.email && (
                <a href={`mailto:${viewing.email}`} className="inline-flex h-11 items-center gap-2 rounded-md border border-graphite-200 px-4 text-sm font-semibold hover:border-graphite-900"><Mail className="h-4 w-4" /> E-mail</a>
              )}
              <a href={leadWhatsapp(viewing)} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-md bg-[#1fae5b] px-4 text-sm font-semibold text-white hover:bg-[#178f4a]"><WhatsAppIcon className="h-4 w-4" /> WhatsApp</a>
            </>
          )
        }
      >
        {viewing && (
          <dl className="space-y-4 text-sm">
            <Row label="Nome">{viewing.name}</Row>
            <Row label="Telefone">{formatPhone(viewing.phone)}</Row>
            <Row label="E-mail">{viewing.email || '—'}</Row>
            <Row label="Assunto">{viewing.subject || '—'}</Row>
            {viewing.motorcycles && (
              <Row label="Moto">
                <Link to={`/motos/${viewing.motorcycles.slug}`} target="_blank" className="text-brand-700 underline">{motoTitle(viewing.motorcycles)}</Link>
              </Row>
            )}
            <Row label="Origem">{LEAD_SOURCE[viewing.source]}</Row>
            <Row label="Recebido em">{formatDateTime(viewing.created_at)}</Row>
            <Row label="Status">
              <div className="flex items-center gap-3">
                <Badge tone={LEAD_STATUS[viewing.status].tone}>{LEAD_STATUS[viewing.status].label}</Badge>
                <Select aria-label="Alterar status" value={viewing.status} onChange={(e) => changeStatus(viewing, e.target.value as LeadStatus)} className="h-9 w-44 text-sm">
                  {(Object.keys(LEAD_STATUS) as LeadStatus[]).map((s) => <option key={s} value={s}>{LEAD_STATUS[s].label}</option>)}
                </Select>
              </div>
            </Row>
            <div>
              <dt className="text-xs font-medium tracking-wide text-graphite-500 uppercase">Mensagem</dt>
              <dd className="mt-1.5 rounded-md bg-graphite-50 p-3 whitespace-pre-line text-graphite-800">{viewing.message || '—'}</dd>
            </div>
          </dl>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Excluir lead"
        danger
        loading={deleting}
        confirmLabel="Excluir"
        message={<>Excluir o contato de <strong>{toDelete?.name}</strong>? Esta ação não pode ser desfeita.</>}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3">
      <dt className="text-xs font-medium tracking-wide text-graphite-500 uppercase">{label}</dt>
      <dd className="break-words text-graphite-900">{children}</dd>
    </div>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors ${active ? 'border-ink bg-ink text-white' : 'border-graphite-200 bg-white text-graphite-700 hover:border-graphite-400'}`}
    >
      {children}
    </button>
  )
}
