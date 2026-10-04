import { Suspense, useEffect, useState, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { Bike, ExternalLink, HelpCircle, LayoutDashboard, LogOut, Menu, Settings, Users, X } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Spinner } from '@/components/ui/Feedback'
import { ScrollToTop } from '@/components/layout/PublicLayout'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/cn'

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/motos', label: 'Motos', icon: Bike },
  { to: '/admin/leads', label: 'Leads', icon: Users },
  { to: '/admin/faq', label: 'FAQ', icon: HelpCircle },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
]

export default function AdminLayout() {
  const { session, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [pathname])

  async function logout() {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Administração">
      {LINKS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-white/10 text-white' : 'text-graphite-400 hover:bg-white/5 hover:text-white',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={cn('h-[18px] w-[18px]', isActive && 'text-brand')} />
              {label}
            </>
          )}
        </NavLink>
      ))}
      <div className="mt-auto space-y-1 border-t border-white/10 pt-4 pb-4">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-graphite-400 hover:bg-white/5 hover:text-white">
          <ExternalLink className="h-[18px] w-[18px]" /> Ver site
        </a>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-graphite-400 hover:bg-white/5 hover:text-white">
          <LogOut className="h-[18px] w-[18px]" /> Sair
        </button>
        <p className="truncate px-3 pt-2 text-xs text-graphite-500" title={session?.user.email}>{session?.user.email}</p>
      </div>
    </nav>
  )

  return (
    <div className="min-h-dvh bg-graphite-50">
      <title>Painel | JD MotoConquista</title>
      <meta name="robots" content="noindex, nofollow" />
      <ScrollToTop />
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-ink lg:flex">
        <div className="px-6 py-6"><Logo /></div>
        {nav}
      </aside>

      {/* Topo mobile */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-ink px-4 lg:hidden">
        <Logo compact />
        <span className="text-sm font-semibold text-white">Painel</span>
        <button onClick={() => setOpen(true)} className="rounded-md p-2 text-white hover:bg-white/10" aria-label="Abrir menu">
          <Menu className="h-6 w-6" />
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 animate-fade-in flex-col bg-ink">
            <div className="flex items-center justify-between px-5 py-5">
              <Logo />
              <button onClick={() => setOpen(false)} className="rounded-md p-1.5 text-white hover:bg-white/10" aria-label="Fechar menu"><X className="h-5 w-5" /></button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <Suspense fallback={<Spinner />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  )
}

export function AdminPageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-graphite-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-graphite-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
