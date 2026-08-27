// Hosts de Supabase Storage del proyecto (deben coincidir con next.config images).
const SUPABASE_HOSTS = [
  'mromkwpqrxpxbbxhdofs.supabase.co',
  'wloneprkibfjioxwypaw.supabase.co',
  'yagrwbmsufpvjcgxkuoz.supabase.co',
]

// Hosts externos SIN transformación propia, que se sirven vía proxy de imágenes.
// medianewbuild es el CDN del feed HabiHub: 70.819 fotos en 2.583 propiedades
// (todo el catálogo español) servidas en tamaño original — el listado llegaba a
// 13,4 MB en mobile. Ignora ?width/?w y no expone thumbnails, así que la única
// vía sin re-hostear es un proxy.
const PROXIED_HOSTS = ['medianewbuild.com', 'www.medianewbuild.com']

// wsrv.nl (ex images.weserv.nl): proxy de imágenes gratuito sobre Cloudflare,
// cachea 1 año. Elegido sobre la optimización de Vercel porque esta cuenta ya
// chocó dos veces con límites del plan Hobby (ISR Writes 13/07, deploy
// bloqueado 07/08) y una cuota agotada dejaría el catálogo sin fotos.
// REVERSIBLE: vaciar PROXIED_HOSTS devuelve las URLs originales al instante.
// El re-host propio a Supabase queda como proyecto pendiente (obliga a tocar
// el cron de sync, que pisa image_url/gallery_urls en cada corrida).
const IMAGE_PROXY = 'https://wsrv.nl/'

interface ImageOpts {
  width: number
  quality?: number
}

/**
 * Reescribe URLs de Supabase Storage al endpoint de transformación de imágenes
 * (`/storage/v1/render/image/public/...`) con `width`/`quality`. Supabase devuelve
 * la imagen redimensionada y en WebP (negociado por el header Accept del browser),
 * recortando el egress ~90% frente al original.
 *
 * - URLs que NO son de Supabase (CDN externo como medianewbuild, Unsplash) se
 *   devuelven sin tocar (no se pueden transformar).
 * - Idempotente: si la URL ya apunta al endpoint de render, no la rompe.
 * - Ante cualquier error, devuelve la URL original (nunca rompe el render).
 */
export function optimizedImage(
  url: string | null | undefined,
  opts: ImageOpts,
): string {
  if (!url) return ''
  try {
    const u = new URL(url)
    if (u.hostname === 'wsrv.nl') return url // idempotente: ya proxeada
    if (PROXIED_HOSTS.includes(u.hostname)) {
      // La URL debe ir con esquema y urlencoded: sin `https://` wsrv intenta
      // http:// y medianewbuild responde 521.
      const params = new URLSearchParams({
        url: u.toString(),
        w: String(opts.width),
        q: String(opts.quality ?? 75),
        output: 'webp',
      })
      return `${IMAGE_PROXY}?${params.toString()}`
    }
    if (!SUPABASE_HOSTS.includes(u.hostname)) return url
    if (u.pathname.includes('/storage/v1/render/image/public/')) {
      // Ya transformada: solo asegurar params.
    } else if (u.pathname.includes('/storage/v1/object/public/')) {
      u.pathname = u.pathname.replace(
        '/storage/v1/object/public/',
        '/storage/v1/render/image/public/',
      )
    } else {
      return url
    }
    u.searchParams.set('width', String(opts.width))
    u.searchParams.set('quality', String(opts.quality ?? 70))
    return u.toString()
  } catch {
    return url
  }
}
