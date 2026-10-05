import type { LeadSource, LeadStatus, MotoStatus, SiteSettings } from './types'

/** Dados reais informados pela empresa. Usados quando o banco ainda não respondeu. */
export const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  company_name: 'JD MotoConquista',
  whatsapp: '5583999216437',
  email: 'jdmotoconquista@gmail.com',
  instagram: 'jdmotoconquista',
  region: 'João Pessoa e Santa Rita — PB',
  logo_url: null,
  hero_image_url: null,
  description:
    'Compra, venda e aluguel de motocicletas com intenção de compra. Atendimento online em João Pessoa e Santa Rita — PB.',
  maintenance_mode: false,
}

export const RESPONSIBLE_NAME = 'Davanildo Carneiro'

/**
 * Imagem padrão da home (Unsplash, licença livre: https://unsplash.com/license).
 * Pode ser trocada pelo painel em Configurações > Imagem principal.
 */
export const DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=2000&q=75'
export const DEFAULT_SECTION_IMAGE =
  'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1600&q=70'

export const MOTO_STATUS: Record<MotoStatus, { label: string; tone: 'green' | 'amber' | 'neutral' | 'blue' }> = {
  available: { label: 'Disponível', tone: 'green' },
  reserved: { label: 'Reservada', tone: 'amber' },
  sold: { label: 'Vendida', tone: 'neutral' },
  rented: { label: 'Alugada', tone: 'blue' },
}

export const LEAD_STATUS: Record<LeadStatus, { label: string; tone: 'red' | 'amber' | 'blue' | 'green' | 'neutral' }> = {
  new: { label: 'Novo', tone: 'red' },
  contacted: { label: 'Contatado', tone: 'blue' },
  negotiating: { label: 'Em negociação', tone: 'amber' },
  won: { label: 'Fechado', tone: 'green' },
  lost: { label: 'Perdido', tone: 'neutral' },
}

export const LEAD_SOURCE: Record<LeadSource, string> = {
  contato: 'Formulário de contato',
  moto: 'Página da moto',
  aluguel: 'Aluguel',
  servicos: 'Serviços',
  venda: 'Quero vender minha moto',
  outro: 'Outro',
}

export const CATEGORIES = [
  'Street',
  'Trail',
  'Scooter',
  'Esportiva',
  'Naked',
  'Custom',
  'Touring',
  'Big Trail',
  'Cub / Urbana',
  'Elétrica',
]

export const TRANSMISSIONS = ['Manual', 'Automática', 'Semiautomática', 'CVT']
export const FUELS = ['Gasolina', 'Flex', 'Elétrica']

export const NAV_LINKS = [
  { to: '/', label: 'Início' },
  { to: '/motos', label: 'Motos' },
  { to: '/servicos', label: 'Serviços' },
  { to: '/aluguel', label: 'Aluguel' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contato', label: 'Contato' },
]
