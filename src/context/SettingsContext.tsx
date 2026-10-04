import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchSettings } from '@/lib/api'
import { DEFAULT_SETTINGS } from '@/lib/constants'
import type { SiteSettings } from '@/lib/types'

interface SettingsContextValue {
  settings: SiteSettings
  loaded: boolean
  setSettings: (s: SiteSettings) => void
  refresh: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

/** Mescla o que veio do banco com os dados padrão (campos vazios usam o padrão). */
function merge(remote: SiteSettings | null): SiteSettings {
  if (!remote) return DEFAULT_SETTINGS
  const out = { ...DEFAULT_SETTINGS }
  for (const [k, v] of Object.entries(remote)) {
    if (v !== null && v !== '') (out as Record<string, unknown>)[k] = v
  }
  return out
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(async () => {
    try {
      setSettingsState(merge(await fetchSettings()))
    } catch {
      setSettingsState(DEFAULT_SETTINGS)
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo(
    () => ({ settings, loaded, setSettings: (s: SiteSettings) => setSettingsState(merge(s)), refresh }),
    [settings, loaded, refresh],
  )
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings fora do SettingsProvider')
  return ctx
}
