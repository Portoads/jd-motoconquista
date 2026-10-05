import { Mail, Wrench } from 'lucide-react'
import { Seo } from '@/components/Seo'
import { Logo } from '@/components/Logo'
import { WhatsAppIcon, InstagramIcon } from '@/components/icons'
import { useSettings } from '@/context/SettingsContext'
import { instagramUrl } from '@/lib/format'
import { DEFAULT_WA_MESSAGE, whatsappLink } from '@/lib/whatsapp'

/** Página exibida em todas as rotas públicas quando o modo manutenção está ligado. */
export function Maintenance() {
  const { settings } = useSettings()
  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-ink px-4 py-16 text-center text-white">
      <Seo title={`${settings.company_name} | Site em manutenção`} description="Estamos fazendo melhorias no site. Fale com a gente pelo WhatsApp." noindex />
      <div className="absolute top-1/2 left-1/2 -z-10 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/15 blur-[120px]" aria-hidden />
      <Logo />
      <span className="mt-12 flex h-14 w-14 items-center justify-center rounded-full border border-white/15 text-brand">
        <Wrench className="h-6 w-6" strokeWidth={1.6} aria-hidden />
      </span>
      <h1 className="display-title mt-6 text-4xl sm:text-6xl">Voltamos em breve</h1>
      <p className="mt-5 max-w-md text-base leading-relaxed text-graphite-300">
        Estamos fazendo melhorias no site. Enquanto isso, o atendimento continua normalmente pelo WhatsApp.
      </p>
      <div className="mt-9 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:w-auto sm:flex-row">
        <a
          href={whatsappLink(settings.whatsapp, DEFAULT_WA_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brand px-6 font-semibold text-white transition-colors hover:bg-brand-600"
        >
          <WhatsAppIcon className="h-5 w-5" /> Falar no WhatsApp
        </a>
        {settings.instagram && (
          <a
            href={instagramUrl(settings.instagram)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/25 px-6 font-semibold text-white transition-colors hover:bg-white/10"
          >
            <InstagramIcon className="h-5 w-5" /> @{settings.instagram}
          </a>
        )}
      </div>
      {settings.email && (
        <a href={`mailto:${settings.email}`} className="mt-6 inline-flex items-center gap-2 text-sm text-graphite-400 hover:text-white">
          <Mail className="h-4 w-4" /> {settings.email}
        </a>
      )}
    </main>
  )
}
