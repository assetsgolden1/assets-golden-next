import type { Property } from '@/types'

/**
 * Lista canónica de imágenes de una propiedad, tal como se muestran en el portal:
 * foto principal (`image_url`) seguida de la galería, deduplicadas por URL exacta
 * preservando el orden de aparición.
 *
 * Es la MISMA lista que arma la ficha del portal y la que valida el endpoint de
 * PDF: el cliente manda índices contra esta lista y el servidor la reconstruye
 * igual, de modo que Puppeteer nunca carga URLs arbitrarias.
 */
export function getPropertyImages(
  property: Pick<Property, 'image_url' | 'gallery_urls'>,
): string[] {
  const gallery = Array.isArray(property.gallery_urls) ? property.gallery_urls : []
  return Array.from(
    new Set(
      [
        ...(property.image_url ? [property.image_url] : []),
        ...gallery,
      ].filter((url): url is string => Boolean(url)),
    ),
  )
}

/** Máximo de fotos que el agente puede incluir en el PDF. */
export const MAX_PDF_PHOTOS = 10

/**
 * Sanea una selección de índices contra la lista canónica de imágenes:
 * descarta valores fuera de rango / no enteros, deduplica preservando el orden
 * de selección y recorta al tope permitido. Devuelve las URLs resultantes.
 */
export function resolveSelectedPhotos(
  images: string[],
  indices: unknown,
): string[] {
  if (!Array.isArray(indices)) return []
  const seen = new Set<number>()
  const urls: string[] = []
  for (const raw of indices) {
    const i = Number(raw)
    if (!Number.isInteger(i) || i < 0 || i >= images.length) continue
    if (seen.has(i)) continue
    seen.add(i)
    urls.push(images[i])
    if (urls.length >= MAX_PDF_PHOTOS) break
  }
  return urls
}
