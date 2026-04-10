import type { Metadata } from 'next'
import { getBlogPostsByCategory } from '@/lib/supabase/queries'
import BlogCategoryGrid from '@/components/blog/BlogCategoryGrid'

export const metadata: Metadata = {
  title: 'Blog Inversiones Inmobiliarias | Assets Golden',
  description: 'Artículos sobre inversión inmobiliaria, rentabilidades y mercados internacionales.',
}

export const revalidate = 3600

export default async function BlogInversionesPage() {
  const { data: posts } = await getBlogPostsByCategory('inversiones')
  return <BlogCategoryGrid posts={posts} category="inversiones" />
}
