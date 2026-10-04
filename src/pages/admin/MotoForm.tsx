import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, ImagePlus, Loader2, Save, Star, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ErrorNotice, Spinner } from '@/components/ui/Feedback'
import { Checkbox, Field, Input, Select, Textarea } from '@/components/ui/Field'
import { ConfirmDialog } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import {
  addMotorcycleImages,
  createMotorcycle,
  deleteMotorcycle,
  deleteMotorcycleImage,
  fetchMotorcycleById,
  saveImageOrder,
  slugExists,
  updateMotorcycle,
} from '@/lib/api'
import { CATEGORIES, FUELS, MOTO_STATUS, TRANSMISSIONS } from '@/lib/constants'
import { motoTitle, slugify } from '@/lib/format'
import type { Motorcycle, MotorcycleImage, MotorcycleInput, MotoStatus } from '@/lib/types'
import { AdminPageHeader } from './AdminLayout'

const BRANDS = ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'BMW', 'Triumph', 'Harley-Davidson', 'Royal Enfield', 'Dafra', 'Shineray', 'Haojue', 'Kasinski', 'Ducati', 'KTM', 'Bajaj', 'Mottu', 'Voltz']

interface FormState {
  brand: string
  model: string
  slug: string
  year: string
  price: string
  mileage: string
  engine: string
  category: string
  transmission: string
  fuel: string
  color: string
  description: string
  status: MotoStatus
  featured: boolean
}

const EMPTY: FormState = {
  brand: '',
  model: '',
  slug: '',
  year: '',
  price: '',
  mileage: '',
  engine: '',
  category: '',
  transmission: '',
  fuel: '',
  color: '',
  description: '',
  status: 'available',
  featured: false,
}

function fromMoto(m: Motorcycle): FormState {
  return {
    brand: m.brand,
    model: m.model,
    slug: m.slug,
    year: m.year?.toString() ?? '',
    price: m.price?.toString() ?? '',
    mileage: m.mileage?.toString() ?? '',
    engine: m.engine ?? '',
    category: m.category ?? '',
    transmission: m.transmission ?? '',
    fuel: m.fuel ?? '',
    color: m.color ?? '',
    description: m.description ?? '',
    status: m.status,
    featured: m.featured,
  }
}

const toNum = (v: string) => (v.trim() === '' ? null : Number(v.replace(',', '.')))
const toText = (v: string) => (v.trim() === '' ? null : v.trim())

export default function MotoForm() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const toast = useToast()

  const [moto, setMoto] = useState<Motorcycle | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [slugTouched, setSlugTouched] = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [images, setImages] = useState<MotorcycleImage[]>([])
  const [pending, setPending] = useState<{ file: File; url: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isNew) return
    let alive = true
    setLoading(true)
    fetchMotorcycleById(id!)
      .then((m) => {
        if (!alive) return
        if (!m) setLoadError('Moto não encontrada.')
        else {
          setMoto(m)
          setForm(fromMoto(m))
          setImages(m.motorcycle_images ?? [])
          setSlugTouched(true)
        }
      })
      .catch((e) => alive && setLoadError(e.message))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [id, isNew])

  useEffect(() => () => pending.forEach((p) => URL.revokeObjectURL(p.url)), [pending])

  const autoSlug = useMemo(() => slugify([form.brand, form.model, form.year].filter(Boolean).join(' ')), [form.brand, form.model, form.year])
  useEffect(() => {
    if (!slugTouched) setForm((f) => ({ ...f, slug: autoSlug }))
  }, [autoSlug, slugTouched])

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }))

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.brand.trim()) e.brand = 'Informe a marca.'
    if (!form.model.trim()) e.model = 'Informe o modelo.'
    if (!form.slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(form.slug)) e.slug = 'Use apenas letras minúsculas, números e hífens.'
    const year = toNum(form.year)
    if (year !== null && (!Number.isInteger(year) || year < 1950 || year > new Date().getFullYear() + 1)) e.year = 'Ano inválido.'
    const price = toNum(form.price)
    if (price !== null && (Number.isNaN(price) || price < 0)) e.price = 'Preço inválido.'
    const km = toNum(form.mileage)
    if (km !== null && (!Number.isInteger(km) || km < 0)) e.mileage = 'Quilometragem inválida (use apenas números).'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    if (!validate()) {
      toast('Revise os campos destacados.', 'error')
      return
    }
    setSaving(true)
    try {
      let slug = form.slug
      if (await slugExists(slug, moto?.id)) {
        slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`
      }
      const payload: Omit<MotorcycleInput, 'main_image'> = {
        brand: form.brand.trim(),
        model: form.model.trim(),
        slug,
        year: toNum(form.year),
        price: toNum(form.price),
        mileage: toNum(form.mileage),
        engine: toText(form.engine),
        category: toText(form.category),
        transmission: toText(form.transmission),
        fuel: toText(form.fuel),
        color: toText(form.color),
        description: toText(form.description),
        status: form.status,
        featured: form.featured,
      }
      if (isNew) {
        const created = await createMotorcycle({ ...payload, main_image: null })
        if (pending.length) {
          const imgs = await addMotorcycleImages(created.id, pending.map((p) => p.file), 0)
          await saveImageOrder(created.id, imgs)
        }
        toast('Moto cadastrada com sucesso!')
        navigate(`/admin/motos/${created.id}`, { replace: true })
      } else {
        await updateMotorcycle(moto!.id, payload)
        setForm((f) => ({ ...f, slug }))
        setMoto((m) => (m ? { ...m, ...payload } : m))
        toast('Alterações salvas.')
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Erro ao salvar.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (fileRef.current) fileRef.current.value = ''
    if (isNew) {
      setPending((p) => [...p, ...list.map((file) => ({ file, url: URL.createObjectURL(file) }))])
      return
    }
    setUploading(true)
    try {
      const created = await addMotorcycleImages(moto!.id, list, images.length)
      const next = [...images, ...created]
      setImages(next)
      await saveImageOrder(moto!.id, next)
      toast(`${created.length} foto(s) enviada(s).`)
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Erro no upload.', 'error')
    } finally {
      setUploading(false)
    }
  }

  async function move(index: number, dir: -1 | 1 | 'first') {
    const target = dir === 'first' ? 0 : index + dir
    if (isNew) {
      setPending((p) => reorder(p, index, target))
      return
    }
    const next = reorder(images, index, target)
    setImages(next)
    try {
      await saveImageOrder(moto!.id, next)
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Erro ao reordenar.', 'error')
    }
  }

  async function removeImage(index: number) {
    if (isNew) {
      setPending((p) => p.filter((_, i) => i !== index))
      return
    }
    const img = images[index]
    const next = images.filter((_, i) => i !== index)
    setImages(next)
    try {
      await deleteMotorcycleImage(img)
      await saveImageOrder(moto!.id, next)
      toast('Foto removida.')
    } catch (e) {
      setImages(images)
      toast(e instanceof Error ? e.message : 'Erro ao remover foto.', 'error')
    }
  }

  async function onDelete() {
    if (!moto) return
    setDeleting(true)
    try {
      await deleteMotorcycle({ ...moto, motorcycle_images: images })
      toast('Moto excluída.')
      navigate('/admin/motos', { replace: true })
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Erro ao excluir.', 'error')
      setDeleting(false)
    }
  }

  if (loading) return <Spinner />
  if (loadError)
    return (
      <div className="space-y-4">
        <ErrorNotice message={loadError} />
        <Link to="/admin/motos" className="text-sm font-medium underline">Voltar para motos</Link>
      </div>
    )

  const gallery = isNew ? pending.map((p) => ({ key: p.url, url: p.url })) : images.map((i) => ({ key: i.id, url: i.image_url }))

  return (
    <form onSubmit={onSubmit} noValidate>
      <Link to="/admin/motos" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-graphite-500 hover:text-graphite-900">
        <ArrowLeft className="h-4 w-4" /> Motos
      </Link>
      <AdminPageHeader
        title={isNew ? 'Nova moto' : motoTitle(moto!)}
        description={isNew ? 'Preencha os dados e adicione as fotos.' : 'Edite os dados, o status e as fotos da moto.'}
        actions={
          <>
            {!isNew && (
              <a href={`/motos/${moto!.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-md border border-graphite-200 bg-white px-4 text-sm font-semibold hover:border-graphite-900">
                <ExternalLink className="h-4 w-4" /> Ver no site
              </a>
            )}
            <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>
              {isNew ? 'Cadastrar moto' : 'Salvar alterações'}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-lg border border-graphite-200 bg-white p-5 sm:p-6">
            <h2 className="mb-5 font-semibold">Dados principais</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Marca" required error={errors.brand}>
                {(fid) => (
                  <>
                    <Input id={fid} list="brands" value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Ex.: Honda" />
                    <datalist id="brands">{BRANDS.map((b) => <option key={b} value={b} />)}</datalist>
                  </>
                )}
              </Field>
              <Field label="Modelo" required error={errors.model}>
                {(fid) => <Input id={fid} value={form.model} onChange={(e) => set('model', e.target.value)} placeholder="Ex.: CG 160 Fan" />}
              </Field>
              <Field label="Ano" error={errors.year}>
                {(fid) => <Input id={fid} type="number" inputMode="numeric" value={form.year} onChange={(e) => set('year', e.target.value)} placeholder="Ex.: 2022" />}
              </Field>
              <Field label="Preço (R$)" error={errors.price} hint="Deixe vazio para exibir “Consulte”.">
                {(fid) => <Input id={fid} type="number" inputMode="decimal" min={0} step="0.01" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="Ex.: 15900" />}
              </Field>
              <Field label="Quilometragem (km)" error={errors.mileage}>
                {(fid) => <Input id={fid} type="number" inputMode="numeric" min={0} value={form.mileage} onChange={(e) => set('mileage', e.target.value)} placeholder="Ex.: 12000" />}
              </Field>
              <Field label="Cilindrada">
                {(fid) => <Input id={fid} value={form.engine} onChange={(e) => set('engine', e.target.value)} placeholder="Ex.: 160 cc" />}
              </Field>
              <Field label="Categoria">
                {(fid) => (
                  <>
                    <Input id={fid} list="categories" value={form.category} onChange={(e) => set('category', e.target.value)} placeholder="Ex.: Street" />
                    <datalist id="categories">{CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
                  </>
                )}
              </Field>
              <Field label="Câmbio">
                {(fid) => (
                  <Select id={fid} value={form.transmission} onChange={(e) => set('transmission', e.target.value)}>
                    <option value="">Não informado</option>
                    {[...new Set([...TRANSMISSIONS, form.transmission].filter(Boolean))].map((t) => <option key={t} value={t}>{t}</option>)}
                  </Select>
                )}
              </Field>
              <Field label="Combustível">
                {(fid) => (
                  <Select id={fid} value={form.fuel} onChange={(e) => set('fuel', e.target.value)}>
                    <option value="">Não informado</option>
                    {[...new Set([...FUELS, form.fuel].filter(Boolean))].map((t) => <option key={t} value={t}>{t}</option>)}
                  </Select>
                )}
              </Field>
              <Field label="Cor">
                {(fid) => <Input id={fid} value={form.color} onChange={(e) => set('color', e.target.value)} placeholder="Ex.: Vermelha" />}
              </Field>
              <Field label="Descrição" className="sm:col-span-2">
                {(fid) => <Textarea id={fid} rows={6} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Estado de conservação, revisões, documentação, itens adicionais…" />}
              </Field>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-graphite-200 bg-white p-5 sm:p-6">
            <h2 className="mb-5 font-semibold">Publicação</h2>
            <div className="space-y-4">
              <Field label="Status">
                {(fid) => (
                  <Select id={fid} value={form.status} onChange={(e) => set('status', e.target.value as MotoStatus)}>
                    {(Object.keys(MOTO_STATUS) as MotoStatus[]).map((s) => <option key={s} value={s}>{MOTO_STATUS[s].label}</option>)}
                  </Select>
                )}
              </Field>
              <Checkbox label="Destacar na página inicial" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
              <Field label="Endereço (slug)" error={errors.slug} hint={`/motos/${form.slug || '…'}`}>
                {(fid) => (
                  <Input
                    id={fid}
                    value={form.slug}
                    onChange={(e) => {
                      setSlugTouched(true)
                      set('slug', slugify(e.target.value))
                    }}
                  />
                )}
              </Field>
            </div>
          </section>

          <section className="rounded-lg border border-graphite-200 bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-semibold">Fotos</h2>
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} loading={uploading} icon={<ImagePlus className="h-4 w-4" />}>
                Adicionar fotos
              </Button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} aria-label="Selecionar fotos" />
            </div>
            <p className="mb-4 text-xs text-graphite-500">
              A primeira foto é a principal. Use as setas para reordenar. {isNew && 'As fotos serão enviadas ao cadastrar a moto.'}
            </p>
            {gallery.length === 0 ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  void onFiles(e.dataTransfer.files)
                }}
                className="flex w-full flex-col items-center rounded-lg border-2 border-dashed border-graphite-200 px-4 py-10 text-sm text-graphite-500 hover:border-graphite-400"
              >
                <ImagePlus className="mb-2 h-8 w-8 text-graphite-300" />
                Clique ou arraste fotos aqui
              </button>
            ) : (
              <ul className="grid grid-cols-2 gap-3">
                {gallery.map((g, i) => (
                  <li key={g.key} className="group relative overflow-hidden rounded-md border border-graphite-200">
                    <img src={g.url} alt={`Foto ${i + 1}`} className="aspect-[4/3] w-full object-cover" />
                    {i === 0 && <span className="absolute top-2 left-2 rounded bg-brand px-1.5 py-0.5 text-[0.65rem] font-bold text-white uppercase">Principal</span>}
                    <div className="flex items-center justify-between gap-1 border-t border-graphite-100 bg-white p-1.5">
                      <div className="flex gap-1">
                        <IconBtn label="Mover para trás" disabled={i === 0} onClick={() => move(i, -1)}><ChevronLeft className="h-3.5 w-3.5" /></IconBtn>
                        <IconBtn label="Mover para frente" disabled={i === gallery.length - 1} onClick={() => move(i, 1)}><ChevronRight className="h-3.5 w-3.5" /></IconBtn>
                        <IconBtn label="Definir como principal" disabled={i === 0} onClick={() => move(i, 'first')}><Star className="h-3.5 w-3.5" /></IconBtn>
                      </div>
                      <IconBtn label="Remover foto" danger onClick={() => removeImage(i)}><Trash2 className="h-3.5 w-3.5" /></IconBtn>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {uploading && (
              <p className="mt-3 flex items-center gap-2 text-xs text-graphite-500"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Enviando fotos…</p>
            )}
          </section>

          {!isNew && (
            <section className="rounded-lg border border-brand/20 bg-white p-5 sm:p-6">
              <h2 className="font-semibold text-brand-700">Excluir moto</h2>
              <p className="mt-1 mb-4 text-sm text-graphite-500">Remove a moto e todas as fotos permanentemente.</p>
              <Button type="button" variant="danger" onClick={() => setConfirmDelete(true)} icon={<Trash2 className="h-4 w-4" />}>Excluir moto</Button>
            </section>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 -mx-4 mt-6 border-t border-graphite-200 bg-white/95 p-4 backdrop-blur sm:hidden">
        <Button type="submit" className="w-full" loading={saving} icon={<Save className="h-4 w-4" />}>
          {isNew ? 'Cadastrar moto' : 'Salvar alterações'}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir moto"
        danger
        loading={deleting}
        confirmLabel="Excluir"
        message="Tem certeza? A moto e todas as fotos serão removidas permanentemente."
        onConfirm={onDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </form>
  )
}

function reorder<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

function IconBtn({ children, label, onClick, disabled, danger }: { children: ReactNode; label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-7 w-7 items-center justify-center rounded border border-graphite-200 disabled:opacity-30 ${danger ? 'text-brand-700 hover:bg-brand-50' : 'text-graphite-700 hover:bg-graphite-100'}`}
    >
      {children}
    </button>
  )
}
