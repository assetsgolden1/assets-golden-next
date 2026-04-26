import { supabaseAdmin } from '@/lib/supabase/admin'
import { POST_ZONE_MAPPING } from '@/lib/constants/blogPostZones'
import { getBannerProperty } from '@/lib/blogProperties'

export async function assignBannersToPosts() {
  let updated = 0
  let skipped = 0
  const results: Array<{ slug: string; status: 'updated' | 'skipped'; property?: string }> = []

  for (const mapping of POST_ZONE_MAPPING) {
    const banner = await getBannerProperty(mapping.slug)

    if (!banner) {
      results.push({ slug: mapping.slug, status: 'skipped' })
      skipped++
      continue
    }

    await supabaseAdmin
      .from('blog_posts')
      .update({ banner_image_url: banner.imageUrl, cover_image: banner.imageUrl })
      .eq('slug', mapping.slug)

    results.push({ slug: mapping.slug, status: 'updated', property: banner.title })
    updated++
  }

  return { updated, skipped, results }
}
