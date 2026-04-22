import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { normalizeLocation } from '@/lib/utils/normalizeLocation'

export async function POST(request: NextRequest) {
  const data = await request.json()
  const { id, ...updates } = data

  const country = updates.country === 'Otro'
    ? updates.customCountry
    : updates.country

  const { error } = await supabaseAdmin
    .from('properties')
    .update({
      title: updates.title,
      country,
      province: updates.province || null,
      location: updates.location ? normalizeLocation(updates.location) : null,
      property_type: updates.property_type,
      price: updates.price ? parseInt(updates.price) : null,
      currency: updates.currency,
      area_sqm: updates.area_sqm ? parseInt(updates.area_sqm) : null,
      bedrooms: updates.bedrooms ? parseInt(updates.bedrooms) : null,
      bathrooms: updates.bathrooms ? parseInt(updates.bathrooms) : null,
      description: updates.description || null,
      image_url: updates.image_url ?? null,
      gallery_urls: updates.gallery_urls ?? [],
      featured: updates.featured,
      hidden: updates.hidden,
      status: updates.status,
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/admin/propiedades')
  revalidatePath('/propiedades')
  return NextResponse.json({ success: true })
}
