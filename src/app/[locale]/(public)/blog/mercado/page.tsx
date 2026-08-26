import type { Metadata } from 'next'
import { getBlogPostsByCategory } from '@/lib/supabase/queries'
import BlogCategoryGrid from '@/components/blog/BlogCategoryGrid'
import { buildAlternates } from '@/lib/utils/seoAlternates'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const en = locale === 'en'
  return {
    title: en ? 'Real Estate Market Analysis' : 'Análisis del Mercado Inmobiliario',
    description: en
      ? 'In-depth analysis of property market trends in Spain and leading international destinations. Insights and up-to-date data.'
      : 'Análisis en profundidad de las tendencias del mercado inmobiliario en España y los principales destinos internacionales. Perspectivas y datos actualizados.',
    alternates: buildAlternates('/blog/mercado', locale),
    openGraph: {
      url: en ? '/en/blog/mercado' : '/blog/mercado',
    },
  }
}

export const revalidate = 86400

interface Props {
  params: Promise<{ locale: string }>
}

export default async function BlogMercadoPage({ params }: Props) {
  const { locale } = await params
  const { data: posts } = await getBlogPostsByCategory('mercado', locale)
  return <BlogCategoryGrid posts={posts} category="mercado" locale={locale} />
}
