import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/getUserRole'
import { checkRateLimit, mutationRateLimit, getIdentifier } from '@/lib/ratelimit'
import { logAdminAction } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rateLimitCheck = await checkRateLimit(mutationRateLimit, getIdentifier(request))
  if (!rateLimitCheck.ok) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: rateLimitCheck.retryAfter },
      { status: 429, headers: { 'Retry-After': String(rateLimitCheck.retryAfter) } }
    )
  }

  const { slug, description, description_en, tagline, tagline_en, hero_image_url, card_image_url } = await request.json()

  if (!slug?.trim()) {
    return NextResponse.json({ error: 'slug es requerido' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('country_destinations')
    .update({
      description: description ?? null,
      description_en: description_en ?? null,
      tagline: tagline ?? null,
      tagline_en: tagline_en ?? null,
      hero_image_url: hero_image_url ?? null,
      card_image_url: card_image_url ?? null,
    })
    .eq('slug', slug)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await logAdminAction({
    action: 'update_destination',
    entity_type: 'destination',
    entity_id: slug,
    entity_label: slug,
    metadata: { fields_updated: ['description', 'description_en', 'tagline', 'tagline_en', 'hero_image_url', 'card_image_url'] },
  })

  return NextResponse.json({ success: true })
}
