import type { MetadataRoute } from 'next'
import { getAllPropertySlugs, createStaticClient } from '@/lib/supabase/queries'

const BASE_URL = 'https://assetsgolden.com'

const STATIC_PAGES: MetadataRoute.Sitemap = [
  {
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1.0,
  },
  {
    url: `${BASE_URL}/propiedades`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/vender-tu-piso`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/equipo`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    url: `${BASE_URL}/blog`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  },
  {
    url: `${BASE_URL}/inversiones`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/destinos`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    url: `${BASE_URL}/contacto`,
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 0.5,
  },
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

  const propertyUrls: MetadataRoute.Sitemap = propertySlugs.map((slug) => ({
    url: `${BASE_URL}/propiedades/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const blogUrls: MetadataRoute.Sitemap = blogRows.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.published_at ? new Date(post.published_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...STATIC_PAGES, ...propertyUrls, ...blogUrls]
}
