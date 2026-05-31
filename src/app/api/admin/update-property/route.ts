import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/getUserRole'
import { checkRateLimit, mutationRateLimit, getIdentifier } from '@/lib/ratelimit'
import { revalidatePropertyPaths } from '@/lib/cache/revalidateProperties'
import { normalizePropertyFields } from '@/lib/utils/normalizeProperty'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const rateLimitCheck = await checkRateLimit(
    mutationRateLimit,
    getIdentifier(request)
  )
  if (!rateLimitCheck.ok) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: rateLimitCheck.retryAfter },
      { status: 429, headers: { 'Retry-After': String(rateLimitCheck.retryAfter) } }
    )
  }

  const data = await request.json()
  const { id, ...updates } = data

  const rawCountry = updates.country === 'Otro'
    ? (updates.customCountry as string | undefined)
    : (updates.country as string | undefined)

  if (!rawCountry?.trim()) {
    return NextResponse.json({ error: "El campo 'país' es obligatorio" }, { status: 400 })
  }

  const normalized = normalizePropertyFields({
    country: rawCountry,
    province: updates.province as string | null,
    location: updates.location as string | null,
  })

  const { error } = await supabaseAdmin
    .from('properties')
    .update({
      title: updates.title,
      country: normalized.country,
      province: normalized.province,
      location: normalized.location,
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
      sold: updates.sold ?? false,
      classification: updates.classification ?? null,
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/admin/propiedades')
  revalidatePropertyPaths()
  return NextResponse.json({ success: true })
}
