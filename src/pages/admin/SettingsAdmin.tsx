import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ImagePlus, Power, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { ConfirmDialog } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { useSettings } from '@/context/SettingsContext'
import { fetchSettings, removeMedia, updateSettings, uploadMedia } from '@/lib/api'
import { DEFAULT_HERO_IMAGE } from '@/lib/constants'
import { formatPhone } from '@/lib/format'
import { normalizeWhatsapp } from '@/lib/whatsapp'
import { AdminPageHeader } from './AdminLayout'

interface FormState {
  company_name: string
  whatsapp: string
  email: string
  instagram: string
  region: string
  description: string
  logo_url: string | null
  hero_image_url: string | null
}

export default function SettingsAdmin() {
  const toast = useToast()
  const { setSettings } = useSettings()
  const [form, setForm] = useState<FormState | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<'logo_url' | 'hero_image_url' | null>(null)
  const logoRef = useRef<HTMLInputElement>(null)
  const heroRef = useRef<HTMLInputElement>(null)
  const [maintenance, setMaintenance] = useState(false)
  const [confirmOff, setConfirmOff] = useState(false)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    fetchSettings()
      .then((s) => {
        setMaintenance(!!s?.maintenance_mode)
        setForm({
          company_name: s?.company_name ?? '',
          whatsapp: formatPhone(s?.whatsapp) || '',
          email: s?.email ?? '',
          instagram: s?.instagram ?? '',
          region: s?.region ?? '',
          description: s?.description ?? '',
          logo_url: s?.logo_url ?? null,
          hero_image_url: s?.hero_image_url ?? null,
        })
      })
      .catch((e) => toast(e.message, 'error'))
  }, [toast])

  if (!form) return <p className="text-sm text-graphite-500">Carregando configurações…</p>

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => (f ? { ...f, [k]: v } : f))

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form) return
    const errs: Record<string, string> = {}
    if (!form.company_name.trim()) errs.company_name = 'Informe o nome.'
    const wa = normalizeWhatsapp(form.whatsapp)
    if (wa.length < 12 || wa.length > 13) errs.whatsapp = 'Informe o WhatsApp com DDD.'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) errs.email = 'E-mail inválido.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    try {
      const saved = await updateSettings({
        company_name: form.company_name.trim(),
        whatsapp: wa,
        email: form.email.trim() || null,
        instagram: form.instagram.trim().replace(/^@/, '') || null,
        region: form.region.trim() || null,
        description: form.description.trim() || null,
        logo_url: form.logo_url,
        hero_image_url: form.hero_image_url,
      })
      setSettings(saved)
      toast('Configurações salvas.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao salvar.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function setMaintenanceMode(on: boolean) {
    setToggling(true)
    try {
      const saved = await updateSettings({ maintenance_mode: on })
      setMaintenance(saved.maintenance_mode)
      setSettings(saved)
      setConfirmOff(false)
      toast(on ? 'Site desligado. Os visitantes veem a página de manutenção.' : 'Site ligado novamente.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao alterar.', 'error')
    } finally {
      setToggling(false)
    }
  }

  async function upload(field: 'logo_url' | 'hero_image_url', files: FileList | null) {
    const file = files?.[0]
    if (!file || !form) return
    setUploading(field)
    try {
      const url = await uploadMedia(file, field === 'logo_url' ? 'site/logo' : 'site/hero')
      const old = form[field]
      const saved = await updateSettings({ [field]: url })
      set(field, url)
      setSettings(saved)
      await removeMedia(old)
      toast(field === 'logo_url' ? 'Logo atualizada.' : 'Imagem principal atualizada.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro no upload.', 'error')
    } finally {
      setUploading(null)
      if (logoRef.current) logoRef.current.value = ''
      if (heroRef.current) heroRef.current.value = ''
    }
  }

  async function clearImage(field: 'logo_url' | 'hero_image_url') {
    if (!form) return
    try {
      const old = form[field]
      const saved = await updateSettings({ [field]: null })
      set(field, null)
      setSettings(saved)
      await removeMedia(old)
      toast('Imagem removida. O padrão será usado.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao remover.', 'error')
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <AdminPageHeader
        title="Configurações"
        description="Informações da empresa exibidas em todo o site."
        actions={<Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>Salvar</Button>}
      />
      <section className={`mb-6 flex flex-col gap-4 rounded-lg border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 ${maintenance ? 'border-brand/40 bg-brand-50' : 'border-graphite-200 bg-white'}`}>
        <div className="flex items-start gap-3">
          <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${maintenance ? 'bg-brand' : 'bg-emerald-500'}`} aria-hidden />
          <div>
            <h2 className="font-semibold">{maintenance ? 'Site desligado (em manutenção)' : 'Site ligado'}</h2>
            <p className="mt-1 text-sm text-graphite-600">
              {maintenance
                ? 'Os visitantes veem uma página de manutenção com o seu WhatsApp. Só você, logado, vê o site normal.'
                : 'O site está no ar para todos. Desligue para mostrar uma página de manutenção; o painel continua funcionando.'}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant={maintenance ? 'primary' : 'danger'}
          loading={toggling}
          onClick={() => (maintenance ? setMaintenanceMode(false) : setConfirmOff(true))}
          icon={<Power className="h-4 w-4" />}
          className="shrink-0"
        >
          {maintenance ? 'Ligar o site' : 'Desligar o site'}
        </Button>
      </section>
      <ConfirmDialog
        open={confirmOff}
        title="Desligar o site?"
        message="Os visitantes vão ver uma página de manutenção até você voltar aqui e clicar em Ligar o site."
        confirmLabel="Desligar"
        danger
        loading={toggling}
        onConfirm={() => setMaintenanceMode(true)}
        onClose={() => setConfirmOff(false)}
      />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <section className="rounded-lg border border-graphite-200 bg-white p-5 sm:p-6">
          <h2 className="mb-5 font-semibold">Dados da empresa</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome da empresa" required error={errors.company_name} className="sm:col-span-2">
              {(id) => <Input id={id} value={form.company_name} onChange={(e) => set('company_name', e.target.value)} />}
            </Field>
            <Field label="WhatsApp" required error={errors.whatsapp} hint="Com DDD. Ex.: (83) 99921-6437">
              {(id) => <Input id={id} type="tel" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />}
            </Field>
            <Field label="E-mail" error={errors.email}>
              {(id) => <Input id={id} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />}
            </Field>
            <Field label="Instagram" hint="Somente o usuário, sem @.">
              {(id) => <Input id={id} value={form.instagram} onChange={(e) => set('instagram', e.target.value)} />}
            </Field>
            <Field label="Região de atuação">
              {(id) => <Input id={id} value={form.region} onChange={(e) => set('region', e.target.value)} />}
            </Field>
            <Field label="Descrição" className="sm:col-span-2" hint="Aparece no rodapé e na página Sobre.">
              {(id) => <Textarea id={id} rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} maxLength={600} />}
            </Field>
          </div>
        </section>

        <div className="space-y-6">
          <ImageSetting
            title="Logo"
            hint="PNG ou SVG com fundo transparente, para fundo escuro. Sem logo, o site usa a marca tipográfica."
            url={form.logo_url}
            preview={<div className="flex h-28 items-center justify-center rounded-md bg-ink p-4">{form.logo_url ? <img src={form.logo_url} alt="Logo atual" className="max-h-full max-w-full object-contain" /> : <span className="text-sm text-graphite-400">Marca padrão</span>}</div>}
            loading={uploading === 'logo_url'}
            onPick={() => logoRef.current?.click()}
            onClear={() => clearImage('logo_url')}
          />
          <input ref={logoRef} type="file" accept="image/png,image/svg+xml,image/webp,image/jpeg" className="hidden" onChange={(e) => upload('logo_url', e.target.files)} aria-label="Selecionar logo" />

          <ImageSetting
            title="Imagem principal da home"
            hint="Foto horizontal grande (mínimo 1600px de largura)."
            url={form.hero_image_url}
            preview={<img src={form.hero_image_url || DEFAULT_HERO_IMAGE} alt="Imagem principal" className="aspect-[16/9] w-full rounded-md bg-graphite-100 object-cover" />}
            loading={uploading === 'hero_image_url'}
            onPick={() => heroRef.current?.click()}
            onClear={() => clearImage('hero_image_url')}
          />
          <input ref={heroRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => upload('hero_image_url', e.target.files)} aria-label="Selecionar imagem principal" />
        </div>
      </div>
    </form>
  )
}

function ImageSetting({ title, hint, url, preview, loading, onPick, onClear }: { title: string; hint: string; url: string | null; preview: ReactNode; loading: boolean; onPick: () => void; onClear: () => void }) {
  return (
    <section className="rounded-lg border border-graphite-200 bg-white p-5 sm:p-6">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 mb-4 text-xs text-graphite-500">{hint}</p>
      {preview}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onPick} loading={loading} icon={<ImagePlus className="h-4 w-4" />}>{url ? 'Trocar' : 'Enviar imagem'}</Button>
        {url && <Button type="button" variant="danger" size="sm" onClick={onClear} icon={<Trash2 className="h-4 w-4" />}>Remover</Button>}
      </div>
    </section>
  )
}
