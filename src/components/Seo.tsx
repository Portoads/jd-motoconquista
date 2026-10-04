import { useLocation } from 'react-router'

const SITE_URL = (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '')

interface SeoProps {
  title: string
  description: string
  image?: string | null
  noindex?: boolean
  type?: 'website' | 'product' | 'article'
  jsonLd?: Record<string, unknown>
}

/** Metadados por página (React 19 move <title>/<meta> para o <head> automaticamente). */
export function Seo({ title, description, image, noindex, type = 'website', jsonLd }: SeoProps) {
  const { pathname } = useLocation()
  const origin = SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  const url = `${origin}${pathname === '/' ? '' : pathname}`
  const fullTitle = title.includes('JD MotoConquista') ? title : `${title} | JD MotoConquista`
  const img = image ? (image.startsWith('http') ? image : `${origin}${image}`) : `${origin}/og-image.png`
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url || '/'} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="JD MotoConquista" />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </>
  )
}
