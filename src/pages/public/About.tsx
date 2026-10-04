import { Eye, Handshake, MessageSquareText } from 'lucide-react'
import { Seo } from '@/components/Seo'
import { PageHero } from '@/components/sections/PageHero'
import { CtaBand } from '@/components/sections/CtaBand'
import { useSettings } from '@/context/SettingsContext'
import { RESPONSIBLE_NAME } from '@/lib/constants'
import { formatPhone } from '@/lib/format'

export default function About() {
  const { settings } = useSettings()
  return (
    <>
      <Seo title="Sobre a JD MotoConquista" description={`Conheça a JD MotoConquista: compra, venda e aluguel de motocicletas com intenção de compra em João Pessoa e Santa Rita — PB. Responsável: ${RESPONSIBLE_NAME}.`} />
      <PageHero eyebrow="Sobre nós" title="Sobre a JD MotoConquista" crumbs={[{ label: 'Sobre' }]} />

      <section className="bg-white py-16 sm:py-24">
        <div className="container-site grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-5 text-lg leading-relaxed text-graphite-700">
            <p>
              A <strong className="text-ink">{settings.company_name}</strong> atua na compra e venda de motocicletas e no aluguel de motos com intenção de compra,
              atendendo clientes de <strong className="text-ink">{settings.region}</strong>.
            </p>
            <p>
              O atendimento é feito de forma online: você consulta as motos disponíveis aqui no site, tira dúvidas pelo WhatsApp e conversa diretamente com
              a equipe sobre a opção que faz mais sentido para você.
            </p>
            <p>
              Nosso foco é ajudar quem precisa de uma moto, seja para o dia a dia, para trabalhar com aplicativos e entregas ou para trocar de motocicleta,
              com informações claras sobre cada veículo.
            </p>
          </div>
          <aside className="h-fit rounded-lg border border-graphite-200 bg-graphite-50 p-6 sm:p-8">
            <h2 className="text-xs font-semibold tracking-[0.2em] text-graphite-500 uppercase">Dados da empresa</h2>
            <dl className="mt-5 space-y-4 text-sm">
              {[
                ['Empresa', settings.company_name],
                ['Responsável', RESPONSIBLE_NAME],
                ['Segmento', 'Compra e venda de motocicletas'],
                ['Região', settings.region],
                ['Atendimento', 'Online'],
                ['WhatsApp', formatPhone(settings.whatsapp)],
                ['E-mail', settings.email],
                ['Instagram', `@${settings.instagram?.replace(/^@/, '')}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-graphite-200 pb-3 last:border-0">
                  <dt className="text-graphite-500">{k}</dt>
                  <dd className="text-right font-medium break-all text-graphite-900">{v}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>

      <section className="border-t border-graphite-100 bg-graphite-50 py-16 sm:py-24">
        <div className="container-site grid gap-6 md:grid-cols-3">
          {[
            { icon: Eye, title: 'Transparência', text: 'Fotos, ficha técnica e status atualizados de cada moto anunciada.' },
            { icon: MessageSquareText, title: 'Conversa direta', text: 'Atendimento online, pelo WhatsApp, com quem conhece cada moto.' },
            { icon: Handshake, title: 'Compromisso', text: 'Condições explicadas com clareza antes de qualquer negócio.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-lg border border-graphite-200 bg-white p-7">
              <Icon className="h-7 w-7 text-brand" strokeWidth={1.5} aria-hidden />
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-graphite-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  )
}
