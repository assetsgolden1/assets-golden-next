import type { Metadata } from 'next'
import { getBlogPostsByCategory } from '@/lib/supabase/queries'
import BlogCategoryGrid from '@/components/blog/BlogCategoryGrid'
import { buildAlternates } from '@/lib/utils/seoAlternates'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const en = locale === 'en'
  return {
    title: en ? 'Real Estate News' : 'Noticias Inmobiliarias',
    description: en
      ? 'Property market news from the Assets Golden blog. Updates on prices, regulation and investment in Spain and international markets.'
      : 'Noticias del sector inmobiliario en el blog de Assets Golden. Actualizaciones sobre precios, regulación e inversión en España y los mercados internacionales.',
    alternates: buildAlternates('/blog/noticias', locale),
    openGraph: {
      url: en ? '/en/blog/noticias' : '/blog/noticias',
    },
  }
}

export const revalidate = 86400

interface Props {
  params: Promise<{ locale: string }>
}

export default async function BlogNoticiasPage({ params }: Props) {
  const { locale } = await params
  const { data: posts } = await getBlogPostsByCategory('news', locale)
  return <BlogCategoryGrid posts={posts} category="noticias" locale={locale} />
}
