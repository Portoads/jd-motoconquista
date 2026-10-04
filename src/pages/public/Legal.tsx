import { Seo } from '@/components/Seo'
import { PageHero } from '@/components/sections/PageHero'
import { useSettings } from '@/context/SettingsContext'
import { RESPONSIBLE_NAME } from '@/lib/constants'

const UPDATED = '4 de outubro de 2026'

export function Privacy() {
  const { settings } = useSettings()
  return (
    <>
      <Seo title="Política de privacidade" description="Saiba como a JD MotoConquista coleta, usa e protege seus dados pessoais, em conformidade com a LGPD." />
      <PageHero eyebrow="Legal" title="Política de privacidade" crumbs={[{ label: 'Política de privacidade' }]} />
      <section className="bg-white py-14 sm:py-20">
        <article className="prose-site container-site max-w-3xl">
          <p className="text-sm text-graphite-500">Última atualização: {UPDATED}</p>
          <p>
            Esta política explica como a {settings.company_name} trata os dados pessoais de quem utiliza este site, em conformidade com a Lei Geral de
            Proteção de Dados (Lei nº 13.709/2018 — LGPD).
          </p>
          <h2>1. Quais dados coletamos</h2>
          <ul>
            <li>Dados que você informa nos formulários: nome, telefone, e-mail, assunto e mensagem.</li>
            <li>A moto de interesse, quando o contato é feito a partir de um anúncio.</li>
            <li>Dados técnicos básicos de navegação necessários para o funcionamento do site.</li>
          </ul>
          <h2>2. Para que usamos</h2>
          <ul>
            <li>Responder ao seu contato e prestar o atendimento solicitado.</li>
            <li>Enviar informações sobre motos e serviços que você pediu.</li>
            <li>Cumprir obrigações legais e regulatórias.</li>
          </ul>
          <h2>3. Compartilhamento</h2>
          <p>
            Não vendemos seus dados. Eles são armazenados em provedores de tecnologia contratados para hospedar o site e o banco de dados, que seguem
            padrões de segurança. Ao clicar em botões do WhatsApp ou Instagram, você é direcionado a serviços de terceiros, regidos por suas próprias políticas.
          </p>
          <h2>4. Armazenamento e segurança</h2>
          <p>
            Os dados de contato ficam em ambiente protegido, acessível apenas à equipe autorizada da {settings.company_name}, e são mantidos pelo tempo
            necessário ao atendimento ou ao cumprimento de obrigações legais.
          </p>
          <h2>5. Seus direitos</h2>
          <p>
            Você pode solicitar a confirmação, o acesso, a correção ou a exclusão dos seus dados, além de revogar o consentimento, entrando em contato pelo
            e-mail <a className="text-brand underline" href={`mailto:${settings.email}`}>{settings.email}</a>.
          </p>
          <h2>6. Responsável</h2>
          <p>
            {settings.company_name} — responsável: {RESPONSIBLE_NAME}. Contato: {settings.email}.
          </p>
          <h2>7. Alterações</h2>
          <p>Esta política pode ser atualizada. A versão vigente estará sempre disponível nesta página.</p>
        </article>
      </section>
    </>
  )
}

export function Terms() {
  const { settings } = useSettings()
  return (
    <>
      <Seo title="Termos de uso" description="Termos e condições de uso do site da JD MotoConquista." />
      <PageHero eyebrow="Legal" title="Termos de uso" crumbs={[{ label: 'Termos de uso' }]} />
      <section className="bg-white py-14 sm:py-20">
        <article className="prose-site container-site max-w-3xl">
          <p className="text-sm text-graphite-500">Última atualização: {UPDATED}</p>
          <p>Ao acessar e usar este site, você concorda com os termos abaixo.</p>
          <h2>1. Finalidade do site</h2>
          <p>
            Este site apresenta a {settings.company_name}, seus serviços e as motocicletas anunciadas, e permite que você entre em contato com a empresa.
            O site não realiza vendas, reservas ou contratos de forma automática.
          </p>
          <h2>2. Informações dos anúncios</h2>
          <p>
            Fotos, preços, status e características das motos são informados pela {settings.company_name} e podem ser alterados sem aviso prévio.
            Disponibilidade, valores e condições devem ser sempre confirmados diretamente com a equipe antes de qualquer negociação.
          </p>
          <h2>3. Aluguel com intenção de compra</h2>
          <p>
            As condições dessa modalidade (valores, prazos, requisitos e documentação) são apresentadas individualmente no atendimento e formalizadas em
            contrato próprio. Nenhuma informação deste site constitui proposta ou oferta vinculante.
          </p>
          <h2>4. Uso adequado</h2>
          <ul>
            <li>Não envie informações falsas ou de terceiros sem autorização.</li>
            <li>Não tente acessar áreas restritas ou interferir no funcionamento do site.</li>
          </ul>
          <h2>5. Propriedade intelectual</h2>
          <p>A marca, os textos e o layout deste site pertencem à {settings.company_name} ou são usados com autorização.</p>
          <h2>6. Privacidade</h2>
          <p>
            O tratamento de dados pessoais segue a nossa <a className="text-brand underline" href="/politica-de-privacidade">Política de privacidade</a>.
          </p>
          <h2>7. Contato</h2>
          <p>Dúvidas sobre estes termos: {settings.email}.</p>
        </article>
      </section>
    </>
  )
}
