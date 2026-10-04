import { CalendarCheck, ClipboardList, KeyRound, MessageCircle } from 'lucide-react'
import { Seo } from '@/components/Seo'
import { LinkButton } from '@/components/ui/Button'
import { WhatsAppIcon } from '@/components/icons'
import { LeadForm } from '@/components/LeadForm'
import { PageHero, SectionHeading } from '@/components/sections/PageHero'
import { DriversSection } from '@/components/sections/DriversSection'
import { useSettings } from '@/context/SettingsContext'
import { whatsappLink } from '@/lib/whatsapp'

const STEPS = [
  { icon: MessageCircle, title: 'Fale com a gente', text: 'Conte como pretende usar a moto: trabalho, aplicativo, entregas ou dia a dia.' },
  { icon: ClipboardList, title: 'Conheça as condições', text: 'No atendimento apresentamos as motos disponíveis para esta modalidade, valores, prazos e requisitos.' },
  { icon: KeyRound, title: 'Comece a rodar', text: 'Com tudo combinado e documentado, você começa a usar a moto.' },
  { icon: CalendarCheck, title: 'Conquiste a sua moto', text: 'A modalidade é pensada para quem tem a intenção de, ao final, ficar com a moto.' },
]

export default function Rental() {
  const { settings } = useSettings()
  const wa = whatsappLink(settings.whatsapp, 'Olá, JD MotoConquista! Quero saber mais sobre o aluguel com intenção de compra.')
  return (
    <>
      <Seo title="Aluguel de moto com intenção de compra" description="Entenda o aluguel de motocicletas com intenção de compra da JD MotoConquista, ideal para quem trabalha com Uber, 99, delivery e entregas em João Pessoa e Santa Rita — PB." />
      <PageHero
        eyebrow="Aluguel com intenção de compra"
        title="Use agora. Conquiste depois."
        description="Uma alternativa para quem precisa de uma moto hoje e tem o objetivo de torná-la sua. Todas as condições são apresentadas de forma clara no atendimento."
        crumbs={[{ label: 'Aluguel' }]}
      >
        <LinkButton to={wa} size="lg" icon={<WhatsAppIcon className="h-5 w-5" />}>Consultar condições no WhatsApp</LinkButton>
      </PageHero>

      <section className="bg-white py-16 sm:py-24">
        <div className="container-site">
          <SectionHeading eyebrow="Passo a passo" title="Como funciona" description="O processo é conversado individualmente. Não divulgamos valores fixos no site porque as condições dependem da moto e do perfil de cada cliente." />
          <ol className="mt-12 grid gap-px overflow-hidden rounded-lg border border-graphite-200 bg-graphite-200 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="bg-white p-7">
                <div className="flex items-center justify-between">
                  <Icon className="h-7 w-7 text-brand" strokeWidth={1.5} aria-hidden />
                  <span className="font-display text-3xl font-bold text-graphite-200">0{i + 1}</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-graphite-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-graphite-600">{text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-graphite-500">
            Valores, prazos, documentação e demais requisitos são informados exclusivamente pela equipe da JD MotoConquista durante o atendimento.
          </p>
        </div>
      </section>

      <DriversSection />

      <section className="bg-graphite-50 py-16 sm:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <SectionHeading eyebrow="Tenho interesse" title="Quero saber mais" description="Deixe seus dados e conte como você usaria a moto. Retornamos com as opções disponíveis." />
          <div className="rounded-lg border border-graphite-200 bg-white p-5 sm:p-8">
            <LeadForm source="aluguel" defaultSubject="Aluguel com intenção de compra" subjectLocked whatsappContext="Tenho interesse no aluguel com intenção de compra." />
          </div>
        </div>
      </section>
    </>
  )
}
