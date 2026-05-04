'use server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/getUserRole'

// Propiedades
export async function toggleFeatured(id: string, featured: boolean) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  await supabaseAdmin.from('properties').update({ featured }).eq('id', id)
  revalidatePath('/admin/propiedades')
  revalidatePath('/admin/destacadas')
}

export async function togglePropertyVisibility(id: string, hidden: boolean) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  await supabaseAdmin.from('properties').update({ hidden }).eq('id', id)
  revalidatePath('/admin/propiedades')
  revalidatePath('/propiedades')
}

export async function deleteProperty(id: string) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  await supabaseAdmin.from('properties').delete().eq('id', id)
  revalidatePath('/admin/propiedades')
  revalidatePath('/propiedades')
}

export async function bulkHideProperties(ids: string[]) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  await supabaseAdmin.from('properties').update({ hidden: true }).in('id', ids)
  revalidatePath('/admin/propiedades')
  revalidatePath('/propiedades')
}

export async function bulkDeleteProperties(ids: string[]) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  await supabaseAdmin.from('properties').delete().in('id', ids)
  revalidatePath('/admin/propiedades')
  revalidatePath('/propiedades')
}

export async function togglePropertySold(id: string, sold: boolean) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  const update: Record<string, unknown> = { sold }
  if (sold) update.hidden = true
  await supabaseAdmin.from('properties').update(update).eq('id', id)
  revalidatePath('/admin/propiedades')
  revalidatePath('/propiedades')
}

export async function bulkMarkAsSold(ids: string[]) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  await supabaseAdmin.from('properties').update({ sold: true, hidden: true }).in('id', ids)
  revalidatePath('/admin/propiedades')
  revalidatePath('/propiedades')
}

export async function updateFeaturedOrder(id: string, order: number) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  await supabaseAdmin.from('properties').update({ featured_order: order }).eq('id', id)
  revalidatePath('/admin/destacadas')
}

// Nueva propiedad
export async function createProperty(formData: FormData) {
  try {
    await requireAdmin()
  } catch {
    return { success: false, error: 'No autorizado: requiere rol admin' }
  }
  const title = (formData.get('title') as string).trim()
  if (!title) return { success: false, error: 'Título obligatorio' }

  // Slug único a partir del título
  const baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  const slug = `${baseSlug}-${Date.now().toString(36)}`

  // Subir imagen si viene una
  let imageUrl: string | null = null
  const file = formData.get('image') as File | null
  if (file && file.size > 0) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `properties/${slug}.${ext}`
    const { error: uploadError } = await supabaseAdmin.storage
      .from('property-images')
      .upload(path, file, { upsert: true })
    if (!uploadError) {
      const { data: urlData } = supabaseAdmin.storage
        .from('property-images')
        .getPublicUrl(path)
      imageUrl = urlData.publicUrl
    }
  }

  const price = formData.get('price') ? Number(formData.get('price')) : null
  const bedrooms = formData.get('bedrooms') ? Number(formData.get('bedrooms')) : null
  const bathrooms = formData.get('bathrooms') ? Number(formData.get('bathrooms')) : null
  const area = formData.get('area_sqm') ? Number(formData.get('area_sqm')) : null

  const { error } = await supabaseAdmin.from('properties').insert({
    title,
    slug,
    description: (formData.get('description') as string)?.trim() || null,
    price,
    currency: (formData.get('currency') as string) || 'EUR',
    location: (formData.get('location') as string)?.trim() || null,
    province: (formData.get('province') as string)?.trim() || null,
    country: (formData.get('country') as string)?.trim() || null,
    bedrooms,
    bathrooms,
    area_sqm: area,
    property_type: (formData.get('property_type') as string) || null,
    status: (formData.get('status') as string) || 'active',
    is_development: formData.get('is_development') === 'true',
    featured: formData.get('featured') === 'true',
    idealista_url: (formData.get('idealista_url') as string)?.trim() || null,
    image_url: imageUrl,
    hidden: false,
    sold: false,
  })

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/propiedades')
  revalidatePath('/propiedades')
  return { success: true, slug }
}

// Leads
export async function updateLeadStatus(id: string, status: string) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  await supabaseAdmin.from('leads').update({ status }).eq('id', id)
  revalidatePath('/admin/leads')
}

export async function deleteLead(id: string) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  await supabaseAdmin.from('leads').delete().eq('id', id)
  revalidatePath('/admin/leads')
}

// Blog
export async function createBlogPost(data: {
  title: string; slug: string; category: string; excerpt: string;
  content: string; cover_image: string; banner_image_url: string;
  published: boolean; read_time: number
}) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  await supabaseAdmin.from('blog_posts').insert(data)
  revalidatePath('/admin/blog')
}

export async function updateBlogPost(id: string, data: Partial<{
  title: string; slug: string; category: string; excerpt: string;
  content: string; cover_image: string; banner_image_url: string;
  published: boolean; read_time: number
}>) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  await supabaseAdmin.from('blog_posts').update(data).eq('id', id)
  revalidatePath('/admin/blog')
}

export async function deleteBlogPost(id: string) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  await supabaseAdmin.from('blog_posts').delete().eq('id', id)
  revalidatePath('/admin/blog')
}

export async function toggleBlogPublished(id: string, published: boolean) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  await supabaseAdmin.from('blog_posts').update({ published }).eq('id', id)
  revalidatePath('/admin/blog')
}

// Equipo
export async function createTeamMember(data: {
  name: string; member_type: string; role_es: string; country: string;
  order_index: number; photo_url: string; linkedin_url: string; bio_es: string; active: boolean
}) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  await supabaseAdmin.from('team_members').insert(data)
  revalidatePath('/admin/equipo')
}

export async function updateTeamMember(id: string, data: Partial<{
  name: string; member_type: string; role_es: string; country: string;
  order_index: number; photo_url: string; linkedin_url: string; bio_es: string; active: boolean
}>) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  await supabaseAdmin.from('team_members').update(data).eq('id', id)
  revalidatePath('/admin/equipo')
}

export async function deleteTeamMember(id: string) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  await supabaseAdmin.from('team_members').delete().eq('id', id)
  revalidatePath('/admin/equipo')
}
