import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Bike, MessageCircle, Search, ShieldCheck, Smartphone, MapPin } from 'lucide-react'
import { Seo } from '@/components/Seo'
import { LinkButton } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Feedback'
import { WhatsAppIcon } from '@/components/icons'
import { MotoCard, MotoCardSkeleton } from '@/components/moto/MotoCard'
import { SectionHeading } from '@/components/sections/PageHero'
import { ServicesGrid } from '@/components/sections/ServicesGrid'
import { DriversSection } from '@/components/sections/DriversSection'
import { FaqAccordion } from '@/components/sections/FaqAccordion'
import { CtaBand } from '@/components/sections/CtaBand'
import { useSettings } from '@/context/SettingsContext'
import { fetchActiveFaq, fetchFeaturedMotorcycles } from '@/lib/api'
import { DEFAULT_HERO_IMAGE } from '@/lib/constants'
import { useAsync } from '@/lib/useAsync'
import { DEFAULT_WA_MESSAGE, whatsappLink } from '@/lib/whatsapp'

export default function Home() {
  const { settings } = useSettings()
  const motos = useAsync(() => fetchFeaturedMotorcycles(6), [])
  const faq = useAsync(() => fetchActiveFaq(), [])
  const wa = whatsappLink(settings.whatsapp, DEFAULT_WA_MESSAGE)

  return (
    <>
      <Seo
        title="JD MotoConquista | Compra, venda e aluguel de motos em João Pessoa e Santa Rita"
        description="Encontre sua próxima motocicleta com a JD MotoConquista. Compra, venda e aluguel de motos com intenção de compra. Atendimento online em João Pessoa e Santa Rita — PB."
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'AutoDealer',
          name: settings.company_name,
          description: settings.description,
          email: settings.email,
          telephone: `+${settings.whatsapp}`,
          areaServed: ['João Pessoa, PB', 'Santa Rita, PB'],
          sameAs: [`https://instagram.com/${settings.instagram}`],
        }}
      />

      <Hero heroImage={settings.hero_image_url || DEFAULT_HERO_IMAGE} wa={wa} />

      {/* Faixa de atributos reais do atendimento */}
      <section className="border-b border-graphite-100 bg-white">
        <div className="container-site grid grid-cols-1 divide-y divide-graphite-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { icon: Smartphone, title: 'Atendimento online', text: 'Converse pelo WhatsApp, sem sair de casa.' },
            { icon: MapPin, title: 'João Pessoa e Santa Rita', text: 'Atuação na região da Grande João Pessoa — PB.' },
            { icon: ShieldCheck, title: 'Informação transparente', text: 'Detalhes de cada moto direto com quem vende.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-4 py-6 sm:px-6 sm:py-8 first:sm:pl-0">
              <Icon className="mt-0.5 h-6 w-6 shrink-0 text-brand" strokeWidth={1.6} aria-hidden />
              <div>
                <p className="font-semibold text-graphite-900">{title}</p>
                <p className="mt-1 text-sm text-graphite-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Motos em destaque */}
      <section className="bg-graphite-50 py-20 sm:py-28">
        <div className="container-site">
          <SectionHeading
            eyebrow="Catálogo"
            title="Motos disponíveis"
            description="Confira as motocicletas em destaque. Cada anúncio traz fotos, ficha técnica e contato direto pelo WhatsApp."
            action={
              <LinkButton to="/motos" variant="outline" iconRight={<ArrowRight className="h-4 w-4" />}>
                Ver catálogo completo
              </LinkButton>
            }
          />
          <div className="mt-12">
            {motos.loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <MotoCardSkeleton key={i} />
                ))}
              </div>
            ) : motos.data && motos.data.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {motos.data.map((m) => (
                  <MotoCard key={m.id} moto={m} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Bike className="h-6 w-6 text-brand" />}
                title="Novas motos em breve"
                description="Estamos atualizando nosso estoque. Fale com a gente pelo WhatsApp e conte qual moto você procura."
                action={
                  <LinkButton to={wa} icon={<WhatsAppIcon className="h-4 w-4" />}>
                    Falar no WhatsApp
                  </LinkButton>
                }
              />
            )}
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="bg-white py-20 sm:py-28">
        <div className="container-site">
          <SectionHeading
            eyebrow="O que fazemos"
            title="Compra, venda e aluguel"
            description="Três caminhos para você conquistar, trocar ou começar a trabalhar com a sua moto."
          />
          <div className="mt-12">
            <ServicesGrid />
          </div>
        </div>
      </section>

      <DriversSection />

      {/* Como funciona */}
      <section className="bg-white py-20 sm:py-28">
        <div className="container-site">
          <SectionHeading eyebrow="Como funciona" title="Simples do início ao fim" align="center" />
          <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
            {[
              { icon: Search, title: 'Escolha', text: 'Navegue pelo catálogo, use os filtros e veja todos os detalhes da moto que chamou sua atenção.' },
              { icon: MessageCircle, title: 'Converse', text: 'Clique em “Tenho interesse” e fale direto com a JD MotoConquista pelo WhatsApp ou formulário.' },
              { icon: Bike, title: 'Conquiste', text: 'Tire suas dúvidas, conheça as condições no atendimento e siga para o seu próximo passo.' },
            ].map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative text-center md:px-6">
                {i < 2 && <span className="absolute top-7 left-[calc(50%+40px)] hidden h-px w-[calc(100%-80px)] bg-graphite-200 md:block" aria-hidden />}
                <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-graphite-200 bg-white text-ink">
                  <Icon className="h-6 w-6" strokeWidth={1.6} aria-hidden />
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[0.65rem] font-bold text-white">{i + 1}</span>
                </span>
                <h3 className="mt-5 font-display text-2xl font-bold tracking-wide uppercase">{title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-graphite-600">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ resumido */}
      {faq.data && faq.data.length > 0 && (
        <section className="border-t border-graphite-100 bg-graphite-50 py-20 sm:py-28">
          <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.6fr]">
            <div>
              <SectionHeading eyebrow="Dúvidas" title="Perguntas frequentes" description="As respostas para as dúvidas mais comuns sobre nossos serviços." />
              <Link to="/faq" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-graphite-900 hover:text-brand">
                Ver todas as perguntas <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <FaqAccordion items={faq.data.slice(0, 5)} />
          </div>
        </section>
      )}

      <CtaBand />
    </>
  )
}

function Hero({ heroImage, wa }: { heroImage: string; wa: string }) {
  const [imgOk, setImgOk] = useState(true)
  const [loaded, setLoaded] = useState(false)
  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      {/* Composição cinematográfica: foto grande + vinhetas + linha de destaque */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        {imgOk && (
          <img
            src={heroImage}
            alt=""
            fetchPriority="high"
            onLoad={() => setLoaded(true)}
            onError={() => setImgOk(false)}
            className={`h-full w-full object-cover object-[65%_center] transition-all duration-[1400ms] ease-out ${loaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0'}`}
          />
        )}
        {!imgOk && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-[10%] top-1/2 h-[700px] w-[900px] -translate-y-1/2 rounded-full bg-brand/15 blur-[140px]" />
            <span className="absolute right-[-2%] bottom-[8%] font-display text-[22vw] leading-none font-bold tracking-tighter text-transparent uppercase select-none [-webkit-text-stroke:1px_rgb(255_255_255/0.07)]">
              JD
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/50" />
        <div className="grain absolute inset-0" />
        <div className="absolute top-0 bottom-0 left-[8%] hidden w-px bg-gradient-to-b from-transparent via-white/10 to-transparent lg:block" />
      </div>

      <div className="container-site flex min-h-[calc(100svh-64px)] flex-col justify-center py-20 lg:min-h-[calc(100svh-76px)] lg:max-h-[920px]">
        <div className="max-w-3xl">
          <p className="eyebrow animate-fade-up text-graphite-300">JD MotoConquista · João Pessoa e Santa Rita — PB</p>
          <h1 className="display-title mt-6 animate-fade-up text-[3.1rem] [animation-delay:80ms] min-[400px]:text-[3.5rem] sm:text-7xl lg:text-[6.4rem]">
            A moto certa para o seu <span className="relative whitespace-nowrap text-brand">próximo passo.</span>
          </h1>
          <p className="mt-7 max-w-xl animate-fade-up text-base leading-relaxed text-graphite-200 [animation-delay:160ms] sm:text-lg">
            Encontre sua próxima motocicleta com a JD MotoConquista. Consulte nossas opções de compra, venda e aluguel com intenção de compra.
          </p>
          <div className="mt-10 flex animate-fade-up flex-col gap-3 [animation-delay:240ms] sm:flex-row">
            <LinkButton to="/motos" size="lg" iconRight={<ArrowRight className="h-4 w-4" />}>
              Ver motos disponíveis
            </LinkButton>
            <LinkButton to={wa} size="lg" variant="outline-light" icon={<WhatsAppIcon className="h-5 w-5" />}>
              Falar no WhatsApp
            </LinkButton>
          </div>
        </div>

        <div className="mt-16 hidden animate-fade-in items-center gap-8 text-xs tracking-[0.2em] text-graphite-400 uppercase [animation-delay:400ms] sm:flex">
          <span>Compra</span>
          <span className="h-px w-10 bg-white/20" />
          <span>Venda</span>
          <span className="h-px w-10 bg-white/20" />
          <span>Aluguel com intenção de compra</span>
        </div>
      </div>
    </section>
  )
}
