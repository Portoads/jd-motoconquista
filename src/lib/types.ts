export type MotoStatus = 'available' | 'reserved' | 'sold' | 'rented'
export type LeadStatus = 'new' | 'contacted' | 'negotiating' | 'won' | 'lost'
export type LeadSource = 'contato' | 'moto' | 'aluguel' | 'servicos' | 'venda' | 'outro'

export interface MotorcycleImage {
  id: string
  motorcycle_id: string
  image_url: string
  sort_order: number
  created_at: string
}

export interface Motorcycle {
  id: string
  brand: string
  model: string
  slug: string
  year: number | null
  price: number | null
  mileage: number | null
  engine: string | null
  category: string | null
  transmission: string | null
  fuel: string | null
  color: string | null
  description: string | null
  status: MotoStatus
  featured: boolean
  main_image: string | null
  created_at: string
  updated_at: string
  motorcycle_images?: MotorcycleImage[]
}

export type MotorcycleInput = Omit<Motorcycle, 'id' | 'created_at' | 'updated_at' | 'motorcycle_images'>

export interface Lead {
  id: string
  name: string
  phone: string
  email: string | null
  subject: string | null
  message: string | null
  motorcycle_id: string | null
  source: LeadSource
  status: LeadStatus
  created_at: string
  motorcycles?: Pick<Motorcycle, 'brand' | 'model' | 'year' | 'slug'> | null
}

export interface FaqItem {
  id: string
  question: string
  answer: string
  active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface SiteSettings {
  id: number
  company_name: string
  whatsapp: string | null
  email: string | null
  instagram: string | null
  region: string | null
  logo_url: string | null
  hero_image_url: string | null
  description: string | null
  maintenance_mode: boolean
  updated_at?: string
}
