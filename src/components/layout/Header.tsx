import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { WhatsAppIcon } from '@/components/icons'
import { useSettings } from '@/context/SettingsContext'
import { NAV_LINKS } from '@/lib/constants'
import { cn } from '@/lib/cn'
import { DEFAULT_WA_MESSAGE, whatsappLink } from '@/lib/whatsapp'

export function Header() {
  const { settings } = useSettings()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const wa = whatsappLink(settings.whatsapp, DEFAULT_WA_MESSAGE)

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-colors duration-300',
        scrolled || open ? 'border-white/10 bg-ink/95 backdrop-blur-md' : 'border-transparent bg-ink',
      )}
    >
      <div className="container-site flex h-16 items-center justify-between gap-4 lg:h-[76px]">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                cn(
                  'relative rounded-md px-3 py-2 text-[0.88rem] font-medium transition-colors',
                  isActive ? 'text-white' : 'text-graphite-300 hover:text-white',
                  isActive && 'after:absolute after:inset-x-3 after:-bottom-[18px] after:h-0.5 after:bg-brand',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 sm:px-4"
            aria-label="Falar no WhatsApp"
          >
            <WhatsAppIcon className="h-[18px] w-[18px]" />
            <span className="hidden sm:inline">Falar no WhatsApp</span>
          </a>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-white/10 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 top-16 bottom-0 z-40 animate-fade-in overflow-y-auto bg-ink lg:hidden">
          <nav className="container-site flex flex-col py-4" aria-label="Menu móvel">
            {NAV_LINKS.map((l, i) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                style={{ animationDelay: `${i * 35}ms` }}
                className={({ isActive }) =>
                  cn(
                    'flex animate-fade-up items-center justify-between border-b border-white/[0.07] py-4 font-display text-2xl font-semibold tracking-wide uppercase',
                    isActive ? 'text-white' : 'text-graphite-300',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    {isActive && <span className="h-2 w-2 rounded-full bg-brand" />}
                  </>
                )}
              </NavLink>
            ))}
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex h-13 items-center justify-center gap-2 rounded-md bg-brand text-base font-semibold text-white"
            >
              <WhatsAppIcon className="h-5 w-5" /> Falar no WhatsApp
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
