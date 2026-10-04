import { Link } from 'react-router'
import { Mail, MapPin } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { InstagramIcon, WhatsAppIcon } from '@/components/icons'
import { useSettings } from '@/context/SettingsContext'
import { NAV_LINKS } from '@/lib/constants'
import { formatPhone, instagramUrl } from '@/lib/format'
import { DEFAULT_WA_MESSAGE, whatsappLink } from '@/lib/whatsapp'

export function Footer() {
  const { settings } = useSettings()
  const year = new Date().getFullYear()
  return (
    <footer className="grain relative bg-ink text-graphite-300">
      <div className="container-site grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:py-20">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-5 text-sm leading-relaxed text-graphite-400">{settings.description}</p>
        </div>

        <div>
          <h2 className="mb-4 text-xs font-semibold tracking-[0.2em] text-white uppercase">Navegação</h2>
          <ul className="space-y-2.5 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-xs font-semibold tracking-[0.2em] text-white uppercase">Serviços</h2>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/motos" className="hover:text-white">Compra de motos</Link></li>
            <li><Link to="/servicos#venda" className="hover:text-white">Venda da sua moto</Link></li>
            <li><Link to="/aluguel" className="hover:text-white">Aluguel com intenção de compra</Link></li>
            <li><Link to="/aluguel#motoristas" className="hover:text-white">Para motoristas e entregadores</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-xs font-semibold tracking-[0.2em] text-white uppercase">Atendimento online</h2>
          <ul className="space-y-3 text-sm">
            <li>
              <a href={whatsappLink(settings.whatsapp, DEFAULT_WA_MESSAGE)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-white">
                <WhatsAppIcon className="h-4 w-4 shrink-0 text-brand" /> {formatPhone(settings.whatsapp)}
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.email}`} className="flex items-center gap-3 break-all hover:text-white">
                <Mail className="h-4 w-4 shrink-0 text-brand" /> {settings.email}
              </a>
            </li>
            <li>
              <a href={instagramUrl(settings.instagram)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-white">
                <InstagramIcon className="h-4 w-4 shrink-0 text-brand" /> @{settings.instagram?.replace(/^@/, '')}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="h-4 w-4 shrink-0 text-brand" /> {settings.region}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/[0.07]">
        <div className="container-site flex flex-col gap-3 py-6 text-xs text-graphite-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {settings.company_name}. Todos os direitos reservados.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/politica-de-privacidade" className="hover:text-white">Política de privacidade</Link>
            <Link to="/termos-de-uso" className="hover:text-white">Termos de uso</Link>
            <Link to="/admin" className="hover:text-white">Área administrativa</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
