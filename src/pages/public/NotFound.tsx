import { ArrowLeft } from 'lucide-react'
import { Seo } from '@/components/Seo'
import { LinkButton } from '@/components/ui/Button'

export default function NotFound({ title = 'Página não encontrada', message = 'O endereço que você acessou não existe ou foi alterado.' }: { title?: string; message?: string }) {
  return (
    <section className="grain flex min-h-[70vh] items-center bg-ink text-white">
      <Seo title={title} description={message} noindex />
      <div className="container-site py-20">
        <p className="font-display text-8xl font-bold text-brand sm:text-9xl">404</p>
        <h1 className="display-title mt-4 text-4xl sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-lg text-graphite-300">{message}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <LinkButton to="/" icon={<ArrowLeft className="h-4 w-4" />}>Voltar ao início</LinkButton>
          <LinkButton to="/motos" variant="outline-light">Ver motos disponíveis</LinkButton>
        </div>
      </div>
    </section>
  )
}
