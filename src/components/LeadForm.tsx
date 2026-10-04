import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { CheckCircle2, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { WhatsAppIcon } from '@/components/icons'
import { useSettings } from '@/context/SettingsContext'
import { createLead } from '@/lib/api'
import { cn } from '@/lib/cn'
import { maskPhone } from '@/lib/format'
import { isSupabaseConfigured } from '@/lib/supabase'
import type { LeadSource } from '@/lib/types'
import { whatsappLink } from '@/lib/whatsapp'

const SUBJECTS = [
  'Quero comprar uma moto',
  'Quero vender minha moto',
  'Aluguel com intenção de compra',
  'Dúvidas gerais',
]

interface LeadFormProps {
  source: LeadSource
  motorcycleId?: string | null
  defaultSubject?: string
  defaultMessage?: string
  subjectLocked?: boolean
  whatsappContext?: string
  dark?: boolean
  className?: string
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function LeadForm({ source, motorcycleId, defaultSubject, defaultMessage = '', subjectLocked, whatsappContext, dark, className }: LeadFormProps) {
  const { settings } = useSettings()
  const [values, setValues] = useState({
    name: '',
    phone: '',
    email: '',
    subject: defaultSubject ?? '',
    message: defaultMessage,
    website: '', // honeypot anti-spam
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const set = (k: keyof typeof values) => (v: string) => setValues((s) => ({ ...s, [k]: v }))

  function validate() {
    const e: Record<string, string> = {}
    if (values.name.trim().length < 2) e.name = 'Informe seu nome.'
    const digits = values.phone.replace(/\D/g, '')
    if (digits.length < 10) e.phone = 'Informe um telefone com DDD.'
    if (values.email && !emailRe.test(values.email.trim())) e.email = 'E-mail inválido.'
    if (!values.subject) e.subject = 'Escolha um assunto.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    setSubmitError(null)
    if (values.website) {
      setSent(true) // bot: finge sucesso
      return
    }
    if (!validate()) return
    setSending(true)
    try {
      await createLead({
        name: values.name,
        phone: values.phone,
        email: values.email,
        subject: values.subject,
        message: values.message,
        motorcycle_id: motorcycleId ?? null,
        source,
      })
      setSent(true)
    } catch {
      setSubmitError('Não foi possível enviar agora. Tente novamente ou fale com a gente pelo WhatsApp.')
    } finally {
      setSending(false)
    }
  }

  const waMsg = `Olá, JD MotoConquista! Meu nome é ${values.name.trim() || '…'}. ${whatsappContext ?? values.subject ?? ''}`.trim()
  const labelCls = dark ? '[&_label]:text-graphite-200' : ''

  if (sent) {
    return (
      <div className={cn('flex flex-col items-start rounded-lg border p-6 sm:p-8', dark ? 'border-white/10 bg-white/[0.03] text-white' : 'border-emerald-200 bg-emerald-50/50', className)} role="status">
        <CheckCircle2 className="h-9 w-9 text-emerald-500" />
        <h3 className="mt-4 text-xl font-semibold">Mensagem enviada!</h3>
        <p className={cn('mt-2 text-sm leading-relaxed', dark ? 'text-graphite-300' : 'text-graphite-600')}>
          Recebemos seu contato e vamos retornar o quanto antes. Se preferir agilizar, continue a conversa pelo WhatsApp.
        </p>
        <a
          href={whatsappLink(settings.whatsapp, waMsg)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-[#1fae5b] px-5 text-sm font-semibold text-white hover:bg-[#178f4a]"
        >
          <WhatsAppIcon className="h-4 w-4" /> Continuar no WhatsApp
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className={cn('grid gap-4 sm:grid-cols-2', labelCls, className)} aria-label="Formulário de contato">
      <Field label="Nome" required error={errors.name}>
        {(id) => <Input id={id} name="name" autoComplete="name" value={values.name} onChange={(e) => set('name')(e.target.value)} placeholder="Seu nome" maxLength={120} />}
      </Field>
      <Field label="Telefone / WhatsApp" required error={errors.phone}>
        {(id) => (
          <Input id={id} name="phone" type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={(e) => set('phone')(maskPhone(e.target.value))} placeholder="(83) 90000-0000" />
        )}
      </Field>
      <Field label="E-mail" error={errors.email}>
        {(id) => <Input id={id} name="email" type="email" autoComplete="email" value={values.email} onChange={(e) => set('email')(e.target.value)} placeholder="voce@email.com" maxLength={160} />}
      </Field>
      <Field label="Assunto" required error={errors.subject}>
        {(id) =>
          subjectLocked ? (
            <Input id={id} value={values.subject} readOnly />
          ) : (
            <Select id={id} name="subject" value={values.subject} onChange={(e) => set('subject')(e.target.value)}>
              <option value="">Selecione</option>
              {[...new Set([...(defaultSubject ? [defaultSubject] : []), ...SUBJECTS])].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          )
        }
      </Field>
      <Field label="Mensagem" className="sm:col-span-2">
        {(id) => <Textarea id={id} name="message" value={values.message} onChange={(e) => set('message')(e.target.value)} placeholder="Conte o que você procura" maxLength={4000} />}
      </Field>

      <div className="hidden" aria-hidden>
        <label>
          Não preencha
          <input tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set('website')(e.target.value)} />
        </label>
      </div>

      {submitError && <p className="text-sm font-medium text-brand-700 sm:col-span-2" role="alert">{submitError}</p>}
      {!isSupabaseConfigured && (
        <p className="text-xs text-amber-700 sm:col-span-2">O envio pelo formulário ainda não está ativo. Fale com a gente pelo WhatsApp.</p>
      )}

      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className={cn('text-xs leading-relaxed', dark ? 'text-graphite-400' : 'text-graphite-500')}>
          Ao enviar, você concorda com nossa{' '}
          <Link to="/politica-de-privacidade" className="underline underline-offset-2 hover:text-brand">
            política de privacidade
          </Link>
          .
        </p>
        <Button type="submit" loading={sending} icon={<Send className="h-4 w-4" />} className="sm:min-w-44" disabled={!isSupabaseConfigured}>
          Enviar mensagem
        </Button>
      </div>
    </form>
  )
}
