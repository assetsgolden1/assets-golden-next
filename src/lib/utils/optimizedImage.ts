// Hosts de Supabase Storage del proyecto (deben coincidir con next.config images).
const SUPABASE_HOSTS = [
  'mromkwpqrxpxbbxhdofs.supabase.co',
  'wloneprkibfjioxwypaw.supabase.co',
  'yagrwbmsufpvjcgxkuoz.supabase.co',
]

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
