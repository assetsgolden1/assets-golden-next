import type { Metadata } from 'next'
import { getBlogPostsByCategory } from '@/lib/supabase/queries'
import BlogCategoryGrid from '@/components/blog/BlogCategoryGrid'

export const metadata: Metadata = {
  title: 'Artículos de Consejos Inmobiliarios',
  description: 'Los mejores artículos de nuestros expertos para compradores, vendedores e inversores inmobiliarios. Consejos concretos y prácticos del sector.',
  alternates: {
    canonical: '/blog/consejos',
  },
  openGraph: {
    url: '/blog/consejos',
  },
}

export const revalidate = 3600

export default async function BlogConsejosPage() {
  const { data: posts } = await getBlogPostsByCategory('tip')
  return <BlogCategoryGrid posts={posts} category="consejos" />
}
