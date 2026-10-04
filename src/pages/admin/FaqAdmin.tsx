import { useState, type FormEvent } from 'react'
import { ArrowDown, ArrowUp, Eye, EyeOff, HelpCircle, Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorNotice, Spinner } from '@/components/ui/Feedback'
import { Checkbox, Field, Input, Textarea } from '@/components/ui/Field'
import { ConfirmDialog, Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { createFaq, deleteFaq, fetchAllFaq, saveFaqOrder, updateFaq } from '@/lib/api'
import type { FaqItem } from '@/lib/types'
import { useAsync } from '@/lib/useAsync'
import { AdminPageHeader } from './AdminLayout'

type Draft = { id?: string; question: string; answer: string; active: boolean }

export default function FaqAdmin() {
  const toast = useToast()
  const { data, loading, error, reload, setData } = useAsync(fetchAllFaq, [])
  const [draft, setDraft] = useState<Draft | null>(null)
  const [draftErrors, setDraftErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState<FaqItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const items = data ?? []

  async function save(e: FormEvent) {
    e.preventDefault()
    if (!draft) return
    const errs: Record<string, string> = {}
    if (draft.question.trim().length < 3) errs.question = 'Escreva a pergunta.'
    if (!draft.answer.trim()) errs.answer = 'Escreva a resposta.'
    setDraftErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    try {
      if (draft.id) {
        await updateFaq(draft.id, { question: draft.question.trim(), answer: draft.answer.trim(), active: draft.active })
        setData((prev) => (prev ?? []).map((f) => (f.id === draft.id ? { ...f, question: draft.question.trim(), answer: draft.answer.trim(), active: draft.active } : f)))
        toast('Pergunta atualizada.')
      } else {
        const created = await createFaq({ question: draft.question.trim(), answer: draft.answer.trim(), active: draft.active, sort_order: items.length })
        setData((prev) => [...(prev ?? []), created])
        toast('Pergunta criada.')
      }
      setDraft(null)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao salvar.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function toggle(f: FaqItem) {
    setData((prev) => (prev ?? []).map((x) => (x.id === f.id ? { ...x, active: !f.active } : x)))
    try {
      await updateFaq(f.id, { active: !f.active })
      toast(f.active ? 'Pergunta ocultada do site.' : 'Pergunta publicada no site.')
    } catch (err) {
      setData((prev) => (prev ?? []).map((x) => (x.id === f.id ? { ...x, active: f.active } : x)))
      toast(err instanceof Error ? err.message : 'Erro ao atualizar.', 'error')
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= items.length) return
    const next = [...items]
    const [it] = next.splice(index, 1)
    next.splice(target, 0, it)
    const ordered = next.map((f, i) => ({ ...f, sort_order: i }))
    setData(ordered)
    try {
      await saveFaqOrder(ordered)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao reordenar.', 'error')
      reload()
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteFaq(toDelete.id)
      setData((prev) => (prev ?? []).filter((f) => f.id !== toDelete.id))
      setToDelete(null)
      toast('Pergunta excluída.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao excluir.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const openNew = () => {
    setDraftErrors({})
    setDraft({ question: '', answer: '', active: true })
  }

  return (
    <>
      <AdminPageHeader
        title="FAQ"
        description="Perguntas frequentes exibidas no site. Use as setas para definir a ordem."
        actions={<Button onClick={openNew} icon={<Plus className="h-4 w-4" />}>Nova pergunta</Button>}
      />
      {error ? (
        <ErrorNotice message={error} onRetry={reload} />
      ) : loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState icon={<HelpCircle className="h-6 w-6 text-brand" />} title="Nenhuma pergunta cadastrada" description="Cadastre as dúvidas mais comuns dos clientes. Enquanto não houver perguntas ativas, o site mostra um convite para falar no WhatsApp." action={<Button onClick={openNew} icon={<Plus className="h-4 w-4" />}>Cadastrar pergunta</Button>} />
      ) : (
        <ul className="space-y-3">
          {items.map((f, i) => (
            <li key={f.id} className={`flex flex-col gap-4 rounded-lg border bg-white p-4 sm:flex-row sm:items-start ${f.active ? 'border-graphite-200' : 'border-dashed border-graphite-300 opacity-75'}`}>
              <div className="flex gap-1 sm:flex-col">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Mover para cima"><ArrowUp className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Mover para baixo"><ArrowDown className="h-4 w-4" /></Button>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-graphite-900">{f.question}</p>
                  {!f.active && <Badge tone="neutral">Oculta</Badge>}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-graphite-600">{f.answer}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => toggle(f)} aria-label={f.active ? 'Ocultar' : 'Publicar'} title={f.active ? 'Ocultar do site' : 'Publicar no site'}>
                  {f.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => { setDraftErrors({}); setDraft({ id: f.id, question: f.question, answer: f.answer, active: f.active }) }} aria-label="Editar" title="Editar">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="danger" size="icon" className="h-9 w-9" onClick={() => setToDelete(f)} aria-label="Excluir" title="Excluir"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'Editar pergunta' : 'Nova pergunta'}
        footer={
          <>
            <Button variant="outline" onClick={() => setDraft(null)} disabled={saving}>Cancelar</Button>
            <Button type="submit" form="faq-form" loading={saving}>Salvar</Button>
          </>
        }
      >
        {draft && (
          <form id="faq-form" onSubmit={save} className="space-y-4" noValidate>
            <Field label="Pergunta" required error={draftErrors.question}>
              {(id) => <Input id={id} value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} maxLength={300} autoFocus />}
            </Field>
            <Field label="Resposta" required error={draftErrors.answer}>
              {(id) => <Textarea id={id} rows={6} value={draft.answer} onChange={(e) => setDraft({ ...draft, answer: e.target.value })} maxLength={4000} />}
            </Field>
            <Checkbox label="Exibir no site" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
          </form>
        )}
      </Modal>

      <ConfirmDialog open={!!toDelete} title="Excluir pergunta" danger loading={deleting} confirmLabel="Excluir" message={<>Excluir a pergunta “{toDelete?.question}”?</>} onConfirm={confirmDelete} onClose={() => setToDelete(null)} />
    </>
  )
}
