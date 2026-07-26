import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
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

  const title = (data.title as string)?.trim()
  if (!title) {
    return NextResponse.json({ error: 'Título obligatorio' }, { status: 400 })
  }

  const baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  const slug = `${baseSlug}-${Date.now().toString(36)}`

  const rawCountry = data.country === 'Otro'
    ? (data.customCountry as string)?.trim() || null
    : data.country?.trim() || null

  if (!rawCountry) {
    return NextResponse.json({ error: "El campo 'país' es obligatorio" }, { status: 400 })
  }

  const normalized = normalizePropertyFields({
    country: rawCountry,
    province: data.province as string | null,
    location: data.location as string | null,
  })

  const { error } = await supabaseAdmin.from('properties').insert({
    title,
    slug,
    description: data.description?.trim() || null,
    price: data.price ? Number(data.price) : null,
    currency: data.currency || 'EUR',
    location: normalized.location,
    province: normalized.province,
    country: normalized.country,
    bedrooms: data.bedrooms ? Number(data.bedrooms) : null,
    bathrooms: data.bathrooms ? Number(data.bathrooms) : null,
    area_sqm: data.area_sqm ? Number(data.area_sqm) : null,
    property_type: data.property_type || null,
    status: 'active',
    is_development: data.is_development === true || data.is_development === 'true',
    featured: data.featured === true || data.featured === 'true',
    idealista_url: data.idealista_url?.trim() || null,
    image_url: data.image_url ?? null,
    gallery_urls: Array.isArray(data.gallery_urls)
      ? [...new Set((data.gallery_urls as string[]).filter((u) => typeof u === 'string' && u.startsWith('http')))]
      : [],
    hidden: false,
    sold: false,
    classification: data.classification ?? null,
    external_source: 'manual',
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Auto-crear entrada en country_destinations si el país no existe
  if (normalized.country) {
    const countrySlug = normalized.country
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    const { data: existing } = await supabaseAdmin
      .from('country_destinations')
      .select('id')
      .eq('slug', countrySlug)
      .single()

    if (!existing) {
      const firstImage = data.image_url ?? null
      await supabaseAdmin.from('country_destinations').insert({
        country_name: normalized.country,
        slug: countrySlug,
        description: `Propiedades en ${normalized.country}`,
        active: true,
        ...(firstImage ? { hero_image_url: firstImage, card_image_url: firstImage } : {}),
      })
    }
  }

  revalidatePropertyPaths(slug)
  return NextResponse.json({ success: true, slug })
}
