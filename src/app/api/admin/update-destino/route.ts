import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { id, hero_image_url, card_image_url, description, cityName, cityImageUrl } = body
  const active = body.active !== undefined ? Boolean(body.active) : undefined

  if (cityName && cityImageUrl) {
    const { data: current } = await supabaseAdmin
      .from('country_destinations')
      .select('city_images')
      .eq('id', id)
      .single()

    const updated = { ...(current?.city_images ?? {}), [cityName]: cityImageUrl }

    const { data, error } = await supabaseAdmin
      .from('country_destinations')
      .update({ city_images: updated })
      .eq('id', id)
      .select()

    console.log('[update-destino] city result:', { data, error })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const updates: Record<string, unknown> = {}
    if (hero_image_url !== undefined) updates.hero_image_url = hero_image_url
    if (card_image_url !== undefined) updates.card_image_url = card_image_url
    if (description !== undefined) updates.description = description
    if (active !== undefined) updates.active = active

    const { data, error } = await supabaseAdmin
      .from('country_destinations')
      .update(updates)
      .eq('id', id)
      .select()

    console.log('[update-destino] result:', { data, error })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/admin/destinos')
  revalidatePath('/destinos')

  return NextResponse.json({ success: true })
}
