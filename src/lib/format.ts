const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const num = new Intl.NumberFormat('pt-BR')

export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'Consulte'
  return brl.format(Number(value))
}

export function formatKm(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return `${num.format(value)} km`
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

/** Exibe 5583999216437 como (83) 99921-6437. */
export function formatPhone(raw: string | null | undefined): string {
  if (!raw) return ''
  let d = raw.replace(/\D/g, '')
  if (d.length > 11 && d.startsWith('55')) d = d.slice(2)
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return raw
}

/** Máscara de digitação para telefone brasileiro. */
export function maskPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function motoTitle(m: { brand: string; model: string; year?: number | null }): string {
  return `${m.brand} ${m.model}${m.year ? ` ${m.year}` : ''}`
}

export function instagramUrl(handle: string | null | undefined): string {
  const h = (handle ?? '').replace(/^@/, '').trim()
  return `https://instagram.com/${h}`
}
