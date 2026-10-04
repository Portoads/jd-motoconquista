import { Check } from 'lucide-react'
import { Seo } from '@/components/Seo'
import { LinkButton } from '@/components/ui/Button'
import { WhatsAppIcon } from '@/components/icons'
import { LeadForm } from '@/components/LeadForm'
import { PageHero, SectionHeading } from '@/components/sections/PageHero'
import { SERVICES } from '@/components/sections/ServicesGrid'
import { CtaBand } from '@/components/sections/CtaBand'
import { useSettings } from '@/context/SettingsContext'
import { whatsappLink } from '@/lib/whatsapp'

const DETAILS: Record<string, { points: string[]; wa: string }> = {
  compra: {
    points: ['Catálogo com fotos e ficha técnica de cada moto', 'Filtros por marca, ano, preço, categoria e quilometragem', 'Contato direto pelo WhatsApp a partir de cada anúncio'],
    wa: 'Olá, JD MotoConquista! Quero comprar uma moto. Podem me ajudar?',
  },
  venda: {
    points: ['Envie marca, modelo, ano e quilometragem da sua moto', 'Mande fotos atuais pelo WhatsApp', 'A equipe analisa e retorna para conversar sobre a avaliação'],
    wa: 'Olá, JD MotoConquista! Quero vender minha moto. Marca/modelo: ___ Ano: ___ Km: ___',
  },
  aluguel: {
    points: ['Para quem precisa da moto agora e planeja comprá-la', 'Indicado para quem trabalha com aplicativos e entregas', 'Valores, prazos e requisitos são informados no atendimento'],
    wa: 'Olá, JD MotoConquista! Quero saber mais sobre o aluguel com intenção de compra.',
  },
}

export default function Services() {
  const { settings } = useSettings()
  return (
    <>
      <Seo title="Serviços" description="Compra de motos, venda da sua motocicleta e aluguel com intenção de compra. Conheça os serviços da JD MotoConquista em João Pessoa e Santa Rita — PB." />
      <PageHero eyebrow="Serviços" title="Como podemos ajudar" description="Compra, venda e aluguel com intenção de compra, com atendimento online e conversa direta." crumbs={[{ label: 'Serviços' }]} />

      <section className="bg-white py-16 sm:py-24">
        <div className="container-site space-y-6">
          {SERVICES.map(({ id, icon: Icon, title, text, to, cta }, i) => (
            <article id={id} key={id} className="grid scroll-mt-24 gap-8 rounded-lg border border-graphite-200 p-6 sm:p-10 lg:grid-cols-[auto_1fr_1fr] lg:gap-12">
              <div className="flex items-start gap-4 lg:flex-col">
                <span className="font-display text-5xl leading-none font-bold text-graphite-200">0{i + 1}</span>
                <Icon className="h-9 w-9 text-brand" strokeWidth={1.5} aria-hidden />
              </div>
              <div>
                <h2 className="display-title text-3xl text-ink sm:text-4xl">{title}</h2>
                <p className="mt-4 leading-relaxed text-graphite-600">{text}</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <LinkButton to={whatsappLink(settings.whatsapp, DETAILS[id].wa)} icon={<WhatsAppIcon className="h-4 w-4" />}>Falar no WhatsApp</LinkButton>
                  {id !== 'venda' && <LinkButton to={to} variant="outline">{cta}</LinkButton>}
                </div>
              </div>
              <ul className="space-y-3 self-center">
                {DETAILS[id].points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm text-graphite-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden /> {p}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-graphite-100 bg-graphite-50 py-16 sm:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <SectionHeading eyebrow="Quero vender" title="Venda sua moto" description="Preencha os dados abaixo com marca, modelo, ano e quilometragem. A equipe entra em contato para conversar sobre a avaliação." />
          <div className="rounded-lg border border-graphite-200 bg-white p-5 sm:p-8">
            <LeadForm source="venda" defaultSubject="Quero vender minha moto" subjectLocked defaultMessage={'Marca/modelo:\nAno:\nQuilometragem:\n'} whatsappContext="Quero vender minha moto." />
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  )
}
