import type { MetadataRoute } from 'next'
import { getAllPropertySlugs, createStaticClient } from '@/lib/supabase/queries'

const BASE_URL = 'https://assetsgolden.com'

function sitemapEntry(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
  priority: number,
  lastModified?: Date,
): MetadataRoute.Sitemap[number] {
  const url = `${BASE_URL}${path}`
  const enUrl = `${BASE_URL}/en${path === '/' ? '' : path}`
  return {
    url,
    lastModified: lastModified ?? new Date(),
    changeFrequency,
    priority,
    alternates: { languages: { es: url, en: enUrl } },
  }
}

const STATIC_PAGES: MetadataRoute.Sitemap = [
  sitemapEntry('/',                       'weekly',  1.0),
  sitemapEntry('/propiedades',            'daily',   0.9),
  sitemapEntry('/vender-tu-piso',         'monthly', 0.8),
  sitemapEntry('/equipo',                 'monthly', 0.6),
  sitemapEntry('/blog',                   'weekly',  0.7),
  sitemapEntry('/inversiones',            'weekly',  0.8),
  sitemapEntry('/destinos',               'monthly', 0.7),
  sitemapEntry('/contacto',               'yearly',  0.5),
  sitemapEntry('/aviso-legal',            'yearly',  0.3),
  sitemapEntry('/politica-de-privacidad', 'yearly',  0.3),
  sitemapEntry('/politica-de-cookies',    'yearly',  0.3),
  sitemapEntry('/sobre-nosotros',         'monthly', 0.8),
  sitemapEntry('/servicios',              'monthly', 0.8),
  sitemapEntry('/colabora',               'monthly', 0.6),
  sitemapEntry('/mi-demanda',             'monthly', 0.7),
  sitemapEntry('/promociones',            'weekly',  0.5),
  sitemapEntry('/partners',               'monthly', 0.5),
  sitemapEntry('/consejos',               'monthly', 0.4),
  sitemapEntry('/noticias',               'weekly',  0.4),
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createStaticClient()

  const [propertySlugs, blogRows] = await Promise.all([
    getAllPropertySlugs(),
    supabase
      .from('blog_posts')
      .select('slug, published_at')
      .eq('published', true)
      .not('slug', 'is', null)
      .then(({ data }) => data ?? []),
  ])

  const propertyUrls: MetadataRoute.Sitemap = propertySlugs.map((slug) =>
    sitemapEntry(`/propiedades/${slug}`, 'weekly', 0.8),
  )

  const blogUrls: MetadataRoute.Sitemap = blogRows.map((post) =>
    sitemapEntry(
      `/blog/${post.slug}`,
      'monthly',
      0.6,
      post.published_at ? new Date(post.published_at) : undefined,
    ),
  )

  return [...STATIC_PAGES, ...propertyUrls, ...blogUrls]
}
