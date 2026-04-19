import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
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

  const { error } = await supabaseAdmin.from('properties').insert({
    title,
    slug,
    description: data.description?.trim() || null,
    price: data.price ? Number(data.price) : null,
    currency: data.currency || 'EUR',
    location: data.location?.trim() || null,
    province: data.province?.trim() || null,
    country: data.country?.trim() || null,
    bedrooms: data.bedrooms ? Number(data.bedrooms) : null,
    bathrooms: data.bathrooms ? Number(data.bathrooms) : null,
    area_sqm: data.area_sqm ? Number(data.area_sqm) : null,
    property_type: data.property_type || null,
    status: data.status || 'active',
    is_development: data.is_development === true || data.is_development === 'true',
    featured: data.featured === true || data.featured === 'true',
    idealista_url: data.idealista_url?.trim() || null,
    image_url: data.image_url ?? null,
    hidden: false,
    sold: false,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/admin/propiedades')
  revalidatePath('/propiedades')
  return NextResponse.json({ success: true, slug })
}
