import { ArrowRight } from 'lucide-react'
import { LinkButton } from '@/components/ui/Button'
import { WhatsAppIcon } from '@/components/icons'
import { useSettings } from '@/context/SettingsContext'
import { DEFAULT_WA_MESSAGE, whatsappLink } from '@/lib/whatsapp'

export function CtaBand({ title = 'Pronto para o próximo passo?', description = 'Fale com a JD MotoConquista e tire suas dúvidas sobre compra, venda ou aluguel com intenção de compra.' }: { title?: string; description?: string }) {
  const { settings } = useSettings()
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="container-site">
        <div className="grain relative overflow-hidden rounded-xl bg-ink px-6 py-12 text-white sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute top-0 left-0 h-full w-1 bg-brand" aria-hidden />
          <div className="pointer-events-none absolute -right-20 -bottom-32 h-80 w-80 rounded-full bg-brand/15 blur-[100px]" aria-hidden />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="display-title text-4xl sm:text-5xl">{title}</h2>
              <p className="mt-4 text-graphite-300">{description}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <LinkButton to={whatsappLink(settings.whatsapp, DEFAULT_WA_MESSAGE)} size="lg" icon={<WhatsAppIcon className="h-5 w-5" />}>
                Falar no WhatsApp
              </LinkButton>
              <LinkButton to="/motos" size="lg" variant="outline-light" iconRight={<ArrowRight className="h-4 w-4" />}>
                Ver motos
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
