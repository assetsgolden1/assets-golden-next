import type { Metadata } from 'next'
import { getBlogPostsByCategory } from '@/lib/supabase/queries'
import BlogCategoryGrid from '@/components/blog/BlogCategoryGrid'
import { buildAlternates } from '@/lib/utils/seoAlternates'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const en = locale === 'en'
  return {
    title: en ? 'Real Estate Investment Articles' : 'Inversiones Inmobiliarias',
    description: en
      ? 'Specialist articles on international real estate investment. Yields, emerging markets and strategies to diversify your portfolio.'
      : 'Artículos especializados en inversión inmobiliaria internacional. Rentabilidades, mercados emergentes y estrategias para diversificar su cartera de activos.',
    alternates: buildAlternates('/blog/inversiones', locale),
    openGraph: {
      url: en ? '/en/blog/inversiones' : '/blog/inversiones',
    },
  }
}

export const revalidate = 86400

interface Props {
  params: Promise<{ locale: string }>
}

export default async function BlogInversionesPage({ params }: Props) {
  const { locale } = await params
  const { data: posts } = await getBlogPostsByCategory('inversiones', locale)
  return <BlogCategoryGrid posts={posts} category="inversiones" locale={locale} />
}
