import { Link } from 'react-router'
import { ArrowUpRight, HandCoins, KeyRound, ShoppingBag } from 'lucide-react'

export const SERVICES = [
  {
    id: 'compra',
    icon: ShoppingBag,
    title: 'Compra de motos',
    text: 'Encontre a motocicleta ideal para o seu dia a dia, trabalho ou lazer entre as opções disponíveis no nosso catálogo.',
    to: '/motos',
    cta: 'Ver motos disponíveis',
  },
  {
    id: 'venda',
    icon: HandCoins,
    title: 'Venda da sua moto',
    text: 'Quer vender sua motocicleta? Envie os dados da moto e nossa equipe entra em contato para conversar sobre a avaliação.',
    to: '/servicos#venda',
    cta: 'Quero vender minha moto',
  },
  {
    id: 'aluguel',
    icon: KeyRound,
    title: 'Aluguel com intenção de compra',
    text: 'Uma alternativa para quem precisa da moto agora e planeja conquistá-la. As condições são apresentadas no atendimento.',
    to: '/aluguel',
    cta: 'Entender como funciona',
  },
]

export function ServicesGrid({ dark }: { dark?: boolean }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-lg border border-graphite-200 bg-graphite-200 md:grid-cols-3">
      {SERVICES.map(({ id, icon: Icon, title, text, to, cta }, i) => (
        <Link
          key={id}
          to={to}
          className={`group relative flex flex-col p-7 transition-colors sm:p-9 ${dark ? 'bg-graphite-900 hover:bg-graphite-850' : 'bg-white hover:bg-graphite-50'}`}
        >
          <span className="font-display text-sm font-semibold tracking-[0.2em] text-graphite-400">0{i + 1}</span>
          <Icon className="mt-6 h-8 w-8 text-brand" strokeWidth={1.5} aria-hidden />
          <h3 className={`mt-5 text-xl font-semibold ${dark ? 'text-white' : 'text-graphite-900'}`}>{title}</h3>
          <p className={`mt-3 flex-1 text-sm leading-relaxed ${dark ? 'text-graphite-300' : 'text-graphite-600'}`}>{text}</p>
          <span className={`mt-7 inline-flex items-center gap-1.5 text-sm font-semibold ${dark ? 'text-white' : 'text-graphite-900'}`}>
            {cta}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
          <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-brand transition-transform duration-300 group-hover:scale-x-100" aria-hidden />
        </Link>
      ))}
    </div>
  )
}
