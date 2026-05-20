import type { Metadata } from 'next'
import { getBlogPostsByCategory } from '@/lib/supabase/queries'
import BlogCategoryGrid from '@/components/blog/BlogCategoryGrid'

export const metadata: Metadata = {
  title: 'Noticias Inmobiliarias',
  description: 'Últimas noticias y novedades del mercado inmobiliario internacional.',
  alternates: {
    canonical: '/blog/noticias',
  },
  openGraph: {
    url: '/blog/noticias',
  },
}

export const revalidate = 3600

export default async function BlogNoticiasPage() {
  const { data: posts } = await getBlogPostsByCategory('news')
  return <BlogCategoryGrid posts={posts} category="noticias" />
}
