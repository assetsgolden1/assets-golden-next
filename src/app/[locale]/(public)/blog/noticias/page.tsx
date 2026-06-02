import type { Metadata } from 'next'
import { getBlogPostsByCategory } from '@/lib/supabase/queries'
import { getLocale } from 'next-intl/server'
import BlogCategoryGrid from '@/components/blog/BlogCategoryGrid'

export const metadata: Metadata = {
  title: 'Noticias Inmobiliarias',
  description: 'Noticias del sector inmobiliario en el blog de Assets Golden. Actualizaciones sobre precios, regulación e inversión en España y los mercados internacionales.',
  alternates: {
    canonical: '/blog/noticias',
  },
  openGraph: {
    url: '/blog/noticias',
  },
}

export const revalidate = 3600

export default async function BlogNoticiasPage() {
  const locale = await getLocale()
  const { data: posts } = await getBlogPostsByCategory('news', locale)
  return <BlogCategoryGrid posts={posts} category="noticias" />
}
