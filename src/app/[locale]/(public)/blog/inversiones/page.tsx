import type { Metadata } from 'next'
import { getBlogPostsByCategory } from '@/lib/supabase/queries'
import { getLocale } from 'next-intl/server'
import BlogCategoryGrid from '@/components/blog/BlogCategoryGrid'

export const metadata: Metadata = {
  title: 'Inversiones Inmobiliarias',
  description: 'Artículos especializados en inversión inmobiliaria internacional. Rentabilidades, mercados emergentes y estrategias para diversificar su cartera de activos.',
  alternates: {
    canonical: '/blog/inversiones',
  },
  openGraph: {
    url: '/blog/inversiones',
  },
}

export const revalidate = 3600

export default async function BlogInversionesPage() {
  const locale = await getLocale()
  const { data: posts } = await getBlogPostsByCategory('inversiones', locale)
  return <BlogCategoryGrid posts={posts} category="inversiones" />
}
