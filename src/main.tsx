import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource/barlow-condensed/500.css'
import '@fontsource/barlow-condensed/600.css'
import '@fontsource/barlow-condensed/700.css'
import './index.css'
import App from './App'
import { AuthProvider } from '@/context/AuthContext'
import { SettingsProvider } from '@/context/SettingsContext'
import { ToastProvider } from '@/components/ui/Toast'
import { Spinner } from '@/components/ui/Feedback'

// Remove metadados estáticos do index.html: cada página define os seus (componente Seo).
document.querySelectorAll('[data-default]').forEach((el) => el.remove())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<Spinner className="min-h-dvh" />}>
            <App />
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </SettingsProvider>
  </StrictMode>,
)
