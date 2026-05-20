import type { Metadata } from 'next'
import { getBlogPostsByCategory } from '@/lib/supabase/queries'
import BlogCategoryGrid from '@/components/blog/BlogCategoryGrid'

export const metadata: Metadata = {
  title: 'Análisis de Mercado Inmobiliario | Blog Assets Golden',
  description: 'Análisis y tendencias del mercado inmobiliario en España y los principales mercados internacionales.',
  alternates: {
    canonical: '/blog/mercado',
  },
  openGraph: {
    url: '/blog/mercado',
  },
}

export const revalidate = 3600

export default async function BlogMercadoPage() {
  const { data: posts } = await getBlogPostsByCategory('mercado')
  return <BlogCategoryGrid posts={posts} category="mercado" />
}
