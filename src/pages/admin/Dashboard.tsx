import { Link } from 'react-router'
import { ArrowRight, Bike, CircleCheck, Clock, KeyRound, Plus, Users } from 'lucide-react'
import { LinkButton } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState, ErrorNotice, Spinner } from '@/components/ui/Feedback'
import { fetchDashboardStats, fetchRecentLeads } from '@/lib/api'
import { LEAD_SOURCE, LEAD_STATUS } from '@/lib/constants'
import { formatDateTime, motoTitle } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'
import { AdminPageHeader } from './AdminLayout'

export default function Dashboard() {
  const stats = useAsync(fetchDashboardStats, [])
  const leads = useAsync(() => fetchRecentLeads(6), [])

  const cards = stats.data
    ? [
        { label: 'Motos disponíveis', value: stats.data.available, icon: Bike, to: '/admin/motos?status=available', accent: 'text-emerald-600 bg-emerald-50' },
        { label: 'Motos reservadas', value: stats.data.reserved, icon: Clock, to: '/admin/motos?status=reserved', accent: 'text-amber-700 bg-amber-50' },
        { label: 'Motos vendidas', value: stats.data.sold, icon: CircleCheck, to: '/admin/motos?status=sold', accent: 'text-graphite-700 bg-graphite-100' },
        { label: 'Motos alugadas', value: stats.data.rented, icon: KeyRound, to: '/admin/motos?status=rented', accent: 'text-sky-700 bg-sky-50' },
        { label: 'Leads novos', value: stats.data.newLeads, icon: Users, to: '/admin/leads?status=new', accent: 'text-brand-700 bg-brand-50' },
      ]
    : []

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Visão geral do estoque e dos contatos recebidos."
        actions={<LinkButton to="/admin/motos/nova" icon={<Plus className="h-4 w-4" />}>Nova moto</LinkButton>}
      />
      {stats.error ? (
        <ErrorNotice message={`Erro ao carregar indicadores: ${stats.error}`} onRetry={stats.reload} />
      ) : stats.loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {cards.map(({ label, value, icon: Icon, to, accent }) => (
            <Link key={label} to={to} className="group rounded-lg border border-graphite-200 bg-white p-5 transition-shadow hover:shadow-card-hover">
              <span className={`flex h-9 w-9 items-center justify-center rounded-md ${accent}`}><Icon className="h-[18px] w-[18px]" /></span>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-graphite-900">{value}</p>
              <p className="mt-1 text-sm text-graphite-500">{label}</p>
            </Link>
          ))}
        </div>
      )}

      <section className="mt-8 rounded-lg border border-graphite-200 bg-white">
        <div className="flex items-center justify-between border-b border-graphite-100 px-5 py-4">
          <h2 className="font-semibold text-graphite-900">Últimos leads</h2>
          <Link to="/admin/leads" className="inline-flex items-center gap-1 text-sm font-medium text-graphite-600 hover:text-graphite-900">
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {leads.loading ? (
          <Spinner />
        ) : leads.error ? (
          <div className="p-5"><ErrorNotice message={leads.error} onRetry={leads.reload} /></div>
        ) : !leads.data?.length ? (
          <div className="p-5"><EmptyState title="Nenhum lead ainda" description="Os contatos enviados pelos formulários do site aparecerão aqui." /></div>
        ) : (
          <ul className="divide-y divide-graphite-100">
            {leads.data.map((l) => (
              <li key={l.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-graphite-900">{l.name}</p>
                  <p className="truncate text-sm text-graphite-500">
                    {l.motorcycles ? motoTitle(l.motorcycles) : l.subject || LEAD_SOURCE[l.source]}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={LEAD_STATUS[l.status].tone}>{LEAD_STATUS[l.status].label}</Badge>
                  <span className="text-xs whitespace-nowrap text-graphite-400">{formatDateTime(l.created_at)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
