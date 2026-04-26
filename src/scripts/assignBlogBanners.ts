import { supabaseAdmin } from '@/lib/supabase/admin'
import { POST_ZONE_MAPPING } from '@/lib/constants/blogPostZones'
import { getCitiesInZone, ZONE_SLUGS } from '@/lib/constants/spainZones'

type CandidateRow = {
  id: string
  title: string
  image_url: string | null
  gallery_urls: string[] | null
  location: string | null
  country: string | null
}

export async function assignBannersToPosts() {
  const usedUrls = new Set<string>()
  const results: Array<{ slug: string; status: string; property?: string }> = []
  let updated = 0
  let skipped = 0

  for (const mapping of POST_ZONE_MAPPING) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = supabaseAdmin
      .from('properties')
      .select('id, title, image_url, gallery_urls, location, country')
      .in('status', ['active', 'available'])
      .not('hidden', 'eq', true)
      .not('sold', 'eq', true)
      .not('image_url', 'is', null)

    if (mapping.country) {
      query = query.ilike('country', `%${mapping.country}%`)
    }
    if (mapping.city) {
      query = query.ilike('location', `%${mapping.city}%`)
    } else if (mapping.zone) {
      const zoneName = ZONE_SLUGS[mapping.zone]
      if (zoneName) {
        const cities = getCitiesInZone(zoneName)
        if (cities.length > 0) query = query.in('location', cities)
      }
    }

    const { data: candidates } = await query.limit(50)

    if (!candidates || candidates.length === 0) {
      results.push({ slug: mapping.slug, status: 'skipped — no properties' })
      skipped++
      continue
    }

    // Random shuffle
    const shuffled = [...(candidates as CandidateRow[])].sort(() => Math.random() - 0.5)

    // Pick first candidate whose image_url hasn't been used yet
    let chosen: CandidateRow | null = null
    let chosenUrl: string | null = null

    for (const prop of shuffled) {
      const url = prop.image_url ?? prop.gallery_urls?.[0] ?? null
      if (!url) continue
      if (!usedUrls.has(url)) {
        chosen = prop
        chosenUrl = url
        break
      }
    }

    // Fallback: all images already used — take first available
    if (!chosen) {
      for (const prop of shuffled) {
        const url = prop.image_url ?? prop.gallery_urls?.[0] ?? null
        if (url) { chosen = prop; chosenUrl = url; break }
      }
    }

    if (!chosenUrl || !chosen) {
      results.push({ slug: mapping.slug, status: 'skipped — no image url' })
      skipped++
      continue
    }

    usedUrls.add(chosenUrl)

    await supabaseAdmin
      .from('blog_posts')
      .update({ banner_image_url: chosenUrl, cover_image: chosenUrl })
      .eq('slug', mapping.slug)

    updated++
    results.push({ slug: mapping.slug, status: 'updated', property: chosen.title })
  }

  return { updated, skipped, results }
}
