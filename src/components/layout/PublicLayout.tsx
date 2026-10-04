import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Header } from './Header'
import { Footer } from './Footer'
import { WhatsAppIcon } from '@/components/icons'
import { Spinner } from '@/components/ui/Feedback'
import { useSettings } from '@/context/SettingsContext'
import { DEFAULT_WA_MESSAGE, whatsappLink } from '@/lib/whatsapp'

export function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
        return
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, hash])
  return null
}

export function PublicLayout() {
  const { settings } = useSettings()
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <a href="#conteudo" className="sr-only z-[100] rounded bg-white px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Pular para o conteúdo
      </a>
      <ScrollToTop />
      <Header />
      <main id="conteudo" className="flex-1">
        <Suspense fallback={<Spinner className="min-h-[50vh]" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <a
        href={whatsappLink(settings.whatsapp, DEFAULT_WA_MESSAGE)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Conversar no WhatsApp"
        className="fixed right-4 bottom-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#1fae5b] text-white shadow-[0_10px_30px_-8px_rgb(0_0_0/0.45)] transition-transform hover:scale-105 sm:right-6 sm:bottom-6"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>
    </div>
  )
}
