import { HelpCircle } from 'lucide-react'
import { Seo } from '@/components/Seo'
import { LinkButton } from '@/components/ui/Button'
import { EmptyState, ErrorNotice, Spinner } from '@/components/ui/Feedback'
import { WhatsAppIcon } from '@/components/icons'
import { PageHero } from '@/components/sections/PageHero'
import { FaqAccordion } from '@/components/sections/FaqAccordion'
import { CtaBand } from '@/components/sections/CtaBand'
import { useSettings } from '@/context/SettingsContext'
import { fetchActiveFaq } from '@/lib/api'
import { useAsync } from '@/lib/useAsync'
import { whatsappLink } from '@/lib/whatsapp'

export default function Faq() {
  const { settings } = useSettings()
  const { data, loading, error, reload } = useAsync(fetchActiveFaq, [])
  return (
    <>
      <Seo
        title="Perguntas frequentes"
        description="Tire suas dúvidas sobre compra, venda e aluguel de motos com intenção de compra na JD MotoConquista."
        jsonLd={
          data && data.length
            ? {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: data.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
              }
            : undefined
        }
      />
      <PageHero eyebrow="FAQ" title="Perguntas frequentes" description="Não encontrou sua dúvida? Fale com a gente pelo WhatsApp." crumbs={[{ label: 'FAQ' }]} />
      <section className="bg-white py-16 sm:py-24">
        <div className="container-site max-w-4xl">
          {loading ? (
            <Spinner />
          ) : error ? (
            <ErrorNotice message="Não foi possível carregar as perguntas." onRetry={reload} />
          ) : data && data.length > 0 ? (
            <FaqAccordion items={data} />
          ) : (
            <EmptyState
              icon={<HelpCircle className="h-6 w-6 text-brand" />}
              title="Perguntas em breve"
              description="Ainda estamos montando esta seção. Envie sua dúvida pelo WhatsApp e respondemos rapidinho."
              action={<LinkButton to={whatsappLink(settings.whatsapp, 'Olá, JD MotoConquista! Tenho uma dúvida:')} icon={<WhatsAppIcon className="h-4 w-4" />}>Enviar dúvida</LinkButton>}
            />
          )}
        </div>
      </section>
      <CtaBand title="Ainda com dúvidas?" />
    </>
  )
}
