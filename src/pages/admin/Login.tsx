import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { ArrowLeft, Lock } from 'lucide-react'
import { Seo } from '@/components/Seo'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { useAuth } from '@/context/AuthContext'
import { isSupabaseConfigured } from '@/lib/supabase'

export default function Login() {
  const { session, isAdmin, loading, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/admin'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && session && isAdmin) return <Navigate to={from} replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email || !password) {
      setError('Informe e-mail e senha.')
      return
    }
    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grain flex min-h-dvh items-center justify-center bg-ink px-4 py-10">
      <Seo title="Acesso administrativo" description="Área restrita da JD MotoConquista." noindex />
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-xl bg-white p-6 shadow-2xl sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-graphite-100 text-graphite-700"><Lock className="h-5 w-5" /></span>
            <div>
              <h1 className="text-lg font-semibold text-graphite-900">Painel administrativo</h1>
              <p className="text-sm text-graphite-500">Entre com sua conta de administrador.</p>
            </div>
          </div>
          {!isSupabaseConfigured && (
            <p className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
              O Supabase ainda não foi configurado neste ambiente (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
            </p>
          )}
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <Field label="E-mail">
              {(id) => <Input id={id} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />}
            </Field>
            <Field label="Senha">
              {(id) => <Input id={id} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />}
            </Field>
            {error && <p className="rounded-md bg-brand-50 p-3 text-sm font-medium text-brand-700" role="alert">{error}</p>}
            <Button type="submit" className="w-full" size="lg" loading={submitting} disabled={!isSupabaseConfigured}>
              Entrar
            </Button>
          </form>
        </div>
        <Link to="/" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-graphite-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Voltar ao site
        </Link>
      </div>
    </div>
  )
}
