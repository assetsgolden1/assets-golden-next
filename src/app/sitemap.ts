import type { MetadataRoute } from 'next'
import {
  getAllPropertySlugEntries,
  getAllDestinationSlugs,
  createStaticClient,
} from '@/lib/supabase/queries'

const BASE_URL = 'https://assetsgolden.com'

// Cada ruta bilingüe genera DOS entradas (<loc> ES y <loc> EN) que comparten
// el mismo bloque de alternates es/en/x-default. Sin la entrada EN propia,
// Google no recibe las ~2.800 páginas /en (hallazgo de la auditoría 26/08).
// lastModified solo se emite cuando hay fecha real de BD: un lastmod
// inventado (new Date() en cada request) hace que Google lo ignore.
function bilingualEntries(path: string, lastModified?: Date): MetadataRoute.Sitemap {
  const esUrl = `${BASE_URL}${path}`
  const enUrl = `${BASE_URL}/en${path === '/' ? '' : path}`
  const alternates = {
    languages: { es: esUrl, en: enUrl, 'x-default': esUrl },
  }
  return [
    { url: esUrl, ...(lastModified && { lastModified }), alternates },
    { url: enUrl, ...(lastModified && { lastModified }), alternates },
  ]
}

const STATIC_PATHS = [
  '/',
  '/propiedades',
  '/vender-tu-piso',
  '/equipo',
  '/blog',
  '/blog/consejos',
  '/blog/inversiones',
  '/blog/mercado',
  '/blog/noticias',
  '/inversiones',
  '/destinos',
  '/contacto',
  '/aviso-legal',
  '/politica-de-privacidad',
  '/politica-de-cookies',
  '/sobre-nosotros',
  '/servicios',
  '/colabora',
  '/mi-demanda',
  '/promociones',
  '/partners',
  '/consejos',
  '/noticias',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createStaticClient()

  const [propertyEntries, destinationSlugs, blogRows] = await Promise.all([
    getAllPropertySlugEntries(),
    getAllDestinationSlugs(),
    supabase
      .from('blog_posts')
      .select('slug, language, published_at, updated_at')
      .eq('published', true)
      .not('slug', 'is', null)
      .then(({ data }) => data ?? []),
  ])

  const staticUrls = STATIC_PATHS.flatMap((path) => bilingualEntries(path))

  const propertyUrls = propertyEntries.flatMap(({ slug, updated_at }) =>
    bilingualEntries(
      `/propiedades/${slug}`,
      updated_at ? new Date(updated_at) : undefined,
    ),
  )

  // /destinos/[país] — incluye espana (página dedicada) y dedupe
  const destinationUrls = [...new Set(['espana', ...destinationSlugs])].flatMap(
    (slug) => bilingualEntries(`/destinos/${slug}`),
  )

  // Los posts existen en UN solo idioma (filas separadas por language, slugs
  // distintos): la URL depende del idioma de la fila y no hay par es/en que
  // declarar como alternate. Antes los posts EN se listaban como /blog/<slug>
  // (404) — hallazgo crítico de la auditoría 26/08.
  const blogUrls: MetadataRoute.Sitemap = blogRows.map((post) => {
    const prefix = post.language === 'en' ? '/en' : ''
    const modified = post.updated_at ?? post.published_at
    return {
      url: `${BASE_URL}${prefix}/blog/${post.slug}`,
      ...(modified && { lastModified: new Date(modified) }),
    }
  })

  return [...staticUrls, ...destinationUrls, ...propertyUrls, ...blogUrls]
}
