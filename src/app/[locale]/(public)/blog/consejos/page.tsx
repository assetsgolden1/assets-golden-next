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

interface Props {
  params: Promise<{ locale: string }>
}

export default async function BlogConsejosPage({ params }: Props) {
  const { locale } = await params
  const { data: posts } = await getBlogPostsByCategory('tip', locale)
  return <BlogCategoryGrid posts={posts} category="consejos" />
}
