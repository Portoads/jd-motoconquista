export default function handler(req, res) {
  const configured = (process.env.VITE_SITE_URL || '').replace(/\/$/, '')
  const origin = configured || `https://${req.headers['x-forwarded-host'] || req.headers.host}`
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=86400')
  res.status(200).send(`User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${origin}/sitemap.xml\n`)
}
