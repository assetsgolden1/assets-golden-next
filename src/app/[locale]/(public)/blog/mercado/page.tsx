import type { Metadata } from 'next'
import { getBlogPostsByCategory } from '@/lib/supabase/queries'
import { getLocale } from 'next-intl/server'
import BlogCategoryGrid from '@/components/blog/BlogCategoryGrid'

export const metadata: Metadata = {
  title: 'Análisis del Mercado Inmobiliario',
  description: 'Análisis en profundidad de las tendencias del mercado inmobiliario en España y los principales destinos internacionales. Perspectivas y datos actualizados.',
  alternates: {
    canonical: '/blog/mercado',
  },
  openGraph: {
    url: '/blog/mercado',
  },
}

export const revalidate = 3600

export default async function BlogMercadoPage() {
  const locale = await getLocale()
  const { data: posts } = await getBlogPostsByCategory('mercado', locale)
  return <BlogCategoryGrid posts={posts} category="mercado" />
}
