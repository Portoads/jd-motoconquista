// Sitemap dinâmico: páginas fixas + todas as motos cadastradas no Supabase.
const STATIC_PATHS = [
  ['/', '1.0', 'daily'],
  ['/motos', '0.9', 'daily'],
  ['/servicos', '0.7', 'monthly'],
  ['/aluguel', '0.8', 'monthly'],
  ['/sobre', '0.5', 'monthly'],
  ['/contato', '0.6', 'monthly'],
  ['/faq', '0.5', 'weekly'],
  ['/politica-de-privacidade', '0.2', 'yearly'],
  ['/termos-de-uso', '0.2', 'yearly'],
]

function siteOrigin(req) {
  const configured = (process.env.VITE_SITE_URL || '').replace(/\/$/, '')
  if (configured) return configured
  const host = req.headers['x-forwarded-host'] || req.headers.host
  return `https://${host}`
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export default async function handler(req, res) {
  const origin = siteOrigin(req)
  let motos = []
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (url && key) {
    try {
      const r = await fetch(`${url.replace(/\/$/, '')}/rest/v1/motorcycles?select=slug,updated_at&order=updated_at.desc`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      })
      if (r.ok) motos = await r.json()
    } catch {
      motos = []
    }
  }
  const urls = [
    ...STATIC_PATHS.map(([p, priority, freq]) => `<url><loc>${esc(origin + p)}</loc><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`),
    ...motos.map(
      (m) => `<url><loc>${esc(`${origin}/motos/${m.slug}`)}</loc><lastmod>${esc(new Date(m.updated_at).toISOString())}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
    ),
  ]
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`)
}
