import { MEDIA_BUCKET, requireSupabase, supabase } from './supabase'
import type {
  FaqItem,
  Lead,
  LeadSource,
  LeadStatus,
  Motorcycle,
  MotorcycleImage,
  MotorcycleInput,
  MotoStatus,
  SiteSettings,
} from './types'

const MOTO_SELECT = '*, motorcycle_images(*)'

function sortImages(m: Motorcycle): Motorcycle {
  if (m.motorcycle_images) {
    m.motorcycle_images = [...m.motorcycle_images].sort((a, b) => a.sort_order - b.sort_order)
  }
  return m
}

function fail(error: { message: string } | null): void {
  if (error) throw new Error(error.message)
}

/* ------------------------------------------------------------------ */
/* Público                                                             */
/* ------------------------------------------------------------------ */

export async function fetchMotorcycles(): Promise<Motorcycle[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('motorcycles')
    .select(MOTO_SELECT)
    .order('created_at', { ascending: false })
  fail(error)
  return (data as Motorcycle[]).map(sortImages)
}

export async function fetchFeaturedMotorcycles(limit = 6): Promise<Motorcycle[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('motorcycles')
    .select(MOTO_SELECT)
    .in('status', ['available', 'reserved'])
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)
  fail(error)
  return (data as Motorcycle[]).map(sortImages)
}

export async function fetchMotorcycleBySlug(slug: string): Promise<Motorcycle | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('motorcycles').select(MOTO_SELECT).eq('slug', slug).maybeSingle()
  fail(error)
  return data ? sortImages(data as Motorcycle) : null
}

export async function fetchMotorcycleById(id: string): Promise<Motorcycle | null> {
  const db = requireSupabase()
  const { data, error } = await db.from('motorcycles').select(MOTO_SELECT).eq('id', id).maybeSingle()
  fail(error)
  return data ? sortImages(data as Motorcycle) : null
}

export async function fetchRelatedMotorcycles(m: Motorcycle, limit = 3): Promise<Motorcycle[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('motorcycles')
    .select(MOTO_SELECT)
    .neq('id', m.id)
    .in('status', ['available', 'reserved'])
    .order('created_at', { ascending: false })
    .limit(12)
  fail(error)
  const list = (data as Motorcycle[]).map(sortImages)
  // Prioriza mesma categoria / marca, sem inventar nada.
  const score = (x: Motorcycle) => (x.category === m.category ? 2 : 0) + (x.brand === m.brand ? 1 : 0)
  return list.sort((a, b) => score(b) - score(a)).slice(0, limit)
}

export async function fetchActiveFaq(): Promise<FaqItem[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('faq')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  fail(error)
  return data as FaqItem[]
}

export async function fetchSettings(): Promise<SiteSettings | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
  fail(error)
  return (data as SiteSettings) ?? null
}

export interface LeadInput {
  name: string
  phone: string
  email?: string | null
  subject?: string | null
  message?: string | null
  motorcycle_id?: string | null
  source: LeadSource
}

export async function createLead(input: LeadInput): Promise<void> {
  const db = requireSupabase()
  // Sem .select(): visitantes podem inserir, mas não ler leads (RLS).
  const { error } = await db.from('leads').insert({
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || null,
    subject: input.subject?.trim() || null,
    message: input.message?.trim() || null,
    motorcycle_id: input.motorcycle_id ?? null,
    source: input.source,
    status: 'new',
  })
  fail(error)
}

/* ------------------------------------------------------------------ */
/* Administração                                                       */
/* ------------------------------------------------------------------ */

export async function checkIsAdmin(): Promise<boolean> {
  const db = requireSupabase()
  const { data, error } = await db.rpc('is_admin')
  if (error) return false
  return data === true
}

export interface DashboardStats {
  available: number
  reserved: number
  sold: number
  rented: number
  total: number
  newLeads: number
  totalLeads: number
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const db = requireSupabase()
  const [motos, leads] = await Promise.all([
    db.from('motorcycles').select('status'),
    db.from('leads').select('status'),
  ])
  fail(motos.error)
  fail(leads.error)
  const count = (s: MotoStatus) => (motos.data ?? []).filter((m) => m.status === s).length
  return {
    available: count('available'),
    reserved: count('reserved'),
    sold: count('sold'),
    rented: count('rented'),
    total: motos.data?.length ?? 0,
    newLeads: (leads.data ?? []).filter((l) => l.status === 'new').length,
    totalLeads: leads.data?.length ?? 0,
  }
}

export async function fetchRecentLeads(limit = 5): Promise<Lead[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('leads')
    .select('*, motorcycles(brand, model, year, slug)')
    .order('created_at', { ascending: false })
    .limit(limit)
  fail(error)
  return data as Lead[]
}

export async function fetchLeads(): Promise<Lead[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('leads')
    .select('*, motorcycles(brand, model, year, slug)')
    .order('created_at', { ascending: false })
  fail(error)
  return data as Lead[]
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  const db = requireSupabase()
  const { error } = await db.from('leads').update({ status }).eq('id', id)
  fail(error)
}

export async function deleteLead(id: string): Promise<void> {
  const db = requireSupabase()
  const { error } = await db.from('leads').delete().eq('id', id)
  fail(error)
}

export async function slugExists(slug: string, exceptId?: string): Promise<boolean> {
  const db = requireSupabase()
  let q = db.from('motorcycles').select('id').eq('slug', slug)
  if (exceptId) q = q.neq('id', exceptId)
  const { data, error } = await q
  fail(error)
  return (data ?? []).length > 0
}

export async function createMotorcycle(input: MotorcycleInput): Promise<Motorcycle> {
  const db = requireSupabase()
  const { data, error } = await db.from('motorcycles').insert(input).select('*').single()
  fail(error)
  return data as Motorcycle
}

export async function updateMotorcycle(id: string, patch: Partial<MotorcycleInput>): Promise<void> {
  const db = requireSupabase()
  const { error } = await db.from('motorcycles').update(patch).eq('id', id)
  fail(error)
}

export async function deleteMotorcycle(m: Motorcycle): Promise<void> {
  const db = requireSupabase()
  const paths = (m.motorcycle_images ?? []).map((i) => storagePathFromUrl(i.image_url)).filter(Boolean) as string[]
  const { error } = await db.from('motorcycles').delete().eq('id', m.id)
  fail(error)
  if (paths.length) await db.storage.from(MEDIA_BUCKET).remove(paths)
}

/* ------------------------------ Imagens ----------------------------- */

const MAX_IMAGE_SIDE = 1800

/** Redimensiona e converte para WebP no navegador para economizar armazenamento. */
async function optimizeImage(file: File): Promise<Blob> {
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height))
    const w = Math.round(bitmap.width * scale)
    const h = Math.round(bitmap.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.84))
    return blob && blob.size < file.size * 1.2 ? blob : file
  } catch {
    return file
  }
}

export async function uploadMedia(file: File, folder: string): Promise<string> {
  const db = requireSupabase()
  const blob = await optimizeImage(file)
  const ext = blob.type === 'image/webp' ? 'webp' : (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `${folder}/${crypto.randomUUID()}.${ext}`
  const { error } = await db.storage
    .from(MEDIA_BUCKET)
    .upload(path, blob, { contentType: blob.type || file.type, cacheControl: '31536000', upsert: false })
  fail(error)
  return db.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl
}

export function storagePathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`
  const i = url.indexOf(marker)
  return i >= 0 ? decodeURIComponent(url.slice(i + marker.length)) : null
}

export async function removeMedia(url: string | null | undefined): Promise<void> {
  if (!url) return
  const path = storagePathFromUrl(url)
  if (!path) return
  const db = requireSupabase()
  await db.storage.from(MEDIA_BUCKET).remove([path])
}

export async function addMotorcycleImages(motoId: string, files: File[], startOrder: number): Promise<MotorcycleImage[]> {
  const db = requireSupabase()
  const created: MotorcycleImage[] = []
  let order = startOrder
  for (const file of files) {
    const url = await uploadMedia(file, `motorcycles/${motoId}`)
    const { data, error } = await db
      .from('motorcycle_images')
      .insert({ motorcycle_id: motoId, image_url: url, sort_order: order++ })
      .select('*')
      .single()
    fail(error)
    created.push(data as MotorcycleImage)
  }
  return created
}

export async function deleteMotorcycleImage(img: MotorcycleImage): Promise<void> {
  const db = requireSupabase()
  const { error } = await db.from('motorcycle_images').delete().eq('id', img.id)
  fail(error)
  await removeMedia(img.image_url)
}

/** Salva a nova ordem e define a primeira foto como foto principal. */
export async function saveImageOrder(motoId: string, images: MotorcycleImage[]): Promise<void> {
  const db = requireSupabase()
  await Promise.all(
    images.map((img, index) =>
      db
        .from('motorcycle_images')
        .update({ sort_order: index })
        .eq('id', img.id)
        .then(({ error }) => fail(error)),
    ),
  )
  await updateMotorcycle(motoId, { main_image: images[0]?.image_url ?? null })
}

/* -------------------------------- FAQ ------------------------------- */

export async function fetchAllFaq(): Promise<FaqItem[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('faq')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  fail(error)
  return data as FaqItem[]
}

export async function createFaq(input: Pick<FaqItem, 'question' | 'answer' | 'active' | 'sort_order'>): Promise<FaqItem> {
  const db = requireSupabase()
  const { data, error } = await db.from('faq').insert(input).select('*').single()
  fail(error)
  return data as FaqItem
}

export async function updateFaq(id: string, patch: Partial<Pick<FaqItem, 'question' | 'answer' | 'active' | 'sort_order'>>): Promise<void> {
  const db = requireSupabase()
  const { error } = await db.from('faq').update(patch).eq('id', id)
  fail(error)
}

export async function deleteFaq(id: string): Promise<void> {
  const db = requireSupabase()
  const { error } = await db.from('faq').delete().eq('id', id)
  fail(error)
}

export async function saveFaqOrder(items: FaqItem[]): Promise<void> {
  await Promise.all(items.map((item, index) => updateFaq(item.id, { sort_order: index })))
}

/* ---------------------------- Configurações -------------------------- */

export async function updateSettings(patch: Partial<Omit<SiteSettings, 'id' | 'updated_at'>>): Promise<SiteSettings> {
  const db = requireSupabase()
  const { data, error } = await db.from('site_settings').update(patch).eq('id', 1).select('*').single()
  fail(error)
  return data as SiteSettings
}
