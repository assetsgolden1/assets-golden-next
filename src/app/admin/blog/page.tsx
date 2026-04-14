import { supabaseAdmin } from '@/lib/supabase/admin'
import { BlogManager } from '@/components/admin/BlogManager'

interface BlogPost {
  id: string
  title: string
  slug: string | null
  category: string | null
  excerpt: string | null
  content: string | null
  image_url: string | null
  cover_image: string | null
  published: boolean
  published_at: string | null
  created_at: string
  read_time: number | null
}

export default async function BlogPage() {
  const { data } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  const posts = (data as BlogPost[]) ?? []

  return <BlogManager initialPosts={posts} />
}
