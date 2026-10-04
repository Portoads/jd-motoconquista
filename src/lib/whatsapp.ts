import { formatPrice, motoTitle } from './format'
import type { Motorcycle } from './types'

export function normalizeWhatsapp(raw: string | null | undefined): string {
  let d = (raw ?? '').replace(/\D/g, '')
  if (!d) return ''
  if (d.length <= 11) d = `55${d}`
  return d
}

export function whatsappLink(number: string | null | undefined, message?: string): string {
  const n = normalizeWhatsapp(number)
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${n}${text}`
}

export const DEFAULT_WA_MESSAGE = 'Olá, JD MotoConquista! Vim pelo site e gostaria de mais informações.'

export function motoWhatsappMessage(m: Motorcycle, pageUrl?: string): string {
  const parts = [
    `Olá, JD MotoConquista! Tenho interesse na moto ${motoTitle(m)}`,
    m.price != null ? ` (${formatPrice(m.price)})` : '',
    '.',
    pageUrl ? `\n${pageUrl}` : '',
    '\nAinda está disponível?',
  ]
  return parts.join('')
}
