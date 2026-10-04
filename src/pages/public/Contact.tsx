import { Mail, MapPin, Clock } from 'lucide-react'
import { Seo } from '@/components/Seo'
import { InstagramIcon, WhatsAppIcon } from '@/components/icons'
import { LeadForm } from '@/components/LeadForm'
import { PageHero } from '@/components/sections/PageHero'
import { useSettings } from '@/context/SettingsContext'
import { formatPhone, instagramUrl } from '@/lib/format'
import { DEFAULT_WA_MESSAGE, whatsappLink } from '@/lib/whatsapp'

export default function Contact() {
  const { settings } = useSettings()
  const channels = [
    { icon: WhatsAppIcon, label: 'WhatsApp', value: formatPhone(settings.whatsapp), href: whatsappLink(settings.whatsapp, DEFAULT_WA_MESSAGE), external: true },
    { icon: Mail, label: 'E-mail', value: settings.email ?? '', href: `mailto:${settings.email}` },
    { icon: InstagramIcon, label: 'Instagram', value: `@${settings.instagram?.replace(/^@/, '')}`, href: instagramUrl(settings.instagram), external: true },
  ]
  return (
    <>
      <Seo title="Contato" description="Fale com a JD MotoConquista pelo WhatsApp (83) 99921-6437, e-mail ou formulário. Atendimento online em João Pessoa e Santa Rita — PB." />
      <PageHero eyebrow="Contato" title="Fale com a gente" description="Escolha o canal que preferir ou envie sua mensagem pelo formulário." crumbs={[{ label: 'Contato' }]} />

      <section className="bg-white py-16 sm:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
          <div className="space-y-3">
            {channels.map(({ icon: Icon, label, value, href, external }) => (
              <a
                key={label}
                href={href}
                target={external ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-lg border border-graphite-200 p-5 transition-colors hover:border-graphite-900"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-ink text-white transition-colors group-hover:bg-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-medium tracking-wide text-graphite-500 uppercase">{label}</span>
                  <span className="block truncate font-semibold text-graphite-900">{value}</span>
                </span>
              </a>
            ))}
            <div className="flex items-center gap-4 rounded-lg bg-graphite-50 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white text-brand shadow-card"><MapPin className="h-5 w-5" /></span>
              <span>
                <span className="block text-xs font-medium tracking-wide text-graphite-500 uppercase">Região de atuação</span>
                <span className="block font-semibold text-graphite-900">{settings.region}</span>
              </span>
            </div>
            <div className="flex items-center gap-4 rounded-lg bg-graphite-50 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white text-brand shadow-card"><Clock className="h-5 w-5" /></span>
              <span>
                <span className="block text-xs font-medium tracking-wide text-graphite-500 uppercase">Atendimento</span>
                <span className="block font-semibold text-graphite-900">Online</span>
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-graphite-200 p-5 sm:p-8">
            <h2 className="text-2xl font-semibold text-graphite-900">Envie uma mensagem</h2>
            <p className="mt-1 mb-6 text-sm text-graphite-500">Responderemos pelo telefone ou e-mail informado.</p>
            <LeadForm source="contato" />
          </div>
        </div>
      </section>
    </>
  )
}
