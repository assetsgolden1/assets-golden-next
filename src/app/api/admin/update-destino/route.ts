import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { id, hero_image_url, description, cityName, cityImageUrl } = body

  if (cityName && cityImageUrl) {
    const { data: current } = await supabaseAdmin
      .from('country_destinations')
      .select('city_images')
      .eq('id', id)
      .single()

    const updated = { ...(current?.city_images ?? {}), [cityName]: cityImageUrl }

    const { error } = await supabaseAdmin
      .from('country_destinations')
      .update({ city_images: updated })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const updates: Record<string, unknown> = {}
    if (hero_image_url !== undefined) updates.hero_image_url = hero_image_url
    if (description !== undefined) updates.description = description

    const { error } = await supabaseAdmin
      .from('country_destinations')
      .update(updates)
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
