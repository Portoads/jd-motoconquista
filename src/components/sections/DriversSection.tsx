import { ArrowRight, Car, Package, Timer, Wrench } from 'lucide-react'
import { LinkButton } from '@/components/ui/Button'
import { WhatsAppIcon } from '@/components/icons'
import { useSettings } from '@/context/SettingsContext'
import { DEFAULT_SECTION_IMAGE } from '@/lib/constants'
import { whatsappLink } from '@/lib/whatsapp'

const PROFILES = [
  { icon: Car, label: 'Motoristas Uber' },
  { icon: Car, label: 'Motoristas 99' },
  { icon: Package, label: 'Entregadores de delivery' },
  { icon: Timer, label: 'Motoboys' },
  { icon: Wrench, label: 'Profissionais que trabalham de moto' },
]

export function DriversSection() {
  const { settings } = useSettings()
  return (
    <section id="motoristas" className="relative scroll-mt-20 overflow-hidden bg-graphite-950 text-white">
      <div className="absolute inset-0" aria-hidden>
        <img src={DEFAULT_SECTION_IMAGE} alt="" loading="lazy" className="h-full w-full object-cover opacity-25" onError={(e) => (e.currentTarget.style.display = 'none')} />
        <div className="absolute inset-0 bg-gradient-to-r from-graphite-950 via-graphite-950/92 to-graphite-950/60" />
      </div>
      <div className="container-site relative grid gap-12 py-20 sm:py-28 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <p className="eyebrow text-graphite-300">Para quem trabalha sobre duas rodas</p>
          <h2 className="display-title mt-4 text-[2.5rem] sm:text-6xl">
            Sua moto também pode ser sua <span className="text-brand">ferramenta de trabalho.</span>
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-graphite-300 sm:text-lg">
            Se você trabalha com aplicativos de transporte, entregas ou usa a motocicleta no dia a dia profissional, fale com a JD MotoConquista.
            Apresentamos as opções de compra e de aluguel com intenção de compra e explicamos as condições diretamente no atendimento.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <LinkButton
              to={whatsappLink(settings.whatsapp, 'Olá, JD MotoConquista! Uso moto para trabalhar e quero saber mais sobre as opções de compra e aluguel com intenção de compra.')}
              size="lg"
              icon={<WhatsAppIcon className="h-5 w-5" />}
            >
              Quero conversar
            </LinkButton>
            <LinkButton to="/aluguel" size="lg" variant="outline-light" iconRight={<ArrowRight className="h-4 w-4" />}>
              Como funciona o aluguel
            </LinkButton>
          </div>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {PROFILES.map(({ icon: Icon, label }, i) => (
            <li
              key={label}
              className={`flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-sm ${i === PROFILES.length - 1 ? 'sm:col-span-2' : ''}`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand/15 text-brand">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-sm font-medium text-graphite-100">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
