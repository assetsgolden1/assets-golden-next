import type { Metadata } from 'next'
import { getBlogPostsByCategory } from '@/lib/supabase/queries'
import BlogCategoryGrid from '@/components/blog/BlogCategoryGrid'
import { buildAlternates } from '@/lib/utils/seoAlternates'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const en = locale === 'en'
  return {
    title: en ? 'Real Estate Tips & Advice' : 'Artículos de Consejos Inmobiliarios',
    description: en
      ? 'Practical articles from our experts for property buyers, sellers and investors. Concrete, actionable real estate advice.'
      : 'Los mejores artículos de nuestros expertos para compradores, vendedores e inversores inmobiliarios. Consejos concretos y prácticos del sector.',
    alternates: buildAlternates('/blog/consejos', locale),
    openGraph: {
      url: en ? '/en/blog/consejos' : '/blog/consejos',
    },
  }
}

export const revalidate = 86400

interface Props {
  params: Promise<{ locale: string }>
}

export default async function BlogConsejosPage({ params }: Props) {
  const { locale } = await params
  const { data: posts } = await getBlogPostsByCategory('tip', locale)
  return <BlogCategoryGrid posts={posts} category="consejos" locale={locale} />
}
