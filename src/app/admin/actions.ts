'use server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/getUserRole'
import { logAdminAction } from '@/lib/audit'
import { revalidatePropertyPaths } from '@/lib/cache/revalidateProperties'

// Propiedades
export async function toggleFeatured(id: string, featured: boolean) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  const { data: prop } = await supabaseAdmin
    .from('properties').select('title').eq('id', id).maybeSingle()
  await supabaseAdmin.from('properties').update({ featured }).eq('id', id)
  await logAdminAction({
    action: 'toggle_featured',
    entity_type: 'property',
    entity_id: id,
    entity_label: prop?.title ?? null,
    metadata: { featured },
  })
  revalidatePath('/admin/propiedades')
  revalidatePath('/admin/destacadas')
  revalidatePropertyPaths()
}

export async function togglePropertyVisibility(id: string, hidden: boolean) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  const { data: prop } = await supabaseAdmin
    .from('properties').select('title').eq('id', id).maybeSingle()
  await supabaseAdmin.from('properties').update({ hidden }).eq('id', id)
  await logAdminAction({
    action: 'toggle_hidden',
    entity_type: 'property',
    entity_id: id,
    entity_label: prop?.title ?? null,
    metadata: { hidden },
  })
  revalidatePath('/admin/propiedades')
  revalidatePropertyPaths()
}

export async function deleteProperty(id: string) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  const { data: prop } = await supabaseAdmin
    .from('properties').select('title').eq('id', id).maybeSingle()
  await supabaseAdmin.from('properties').delete().eq('id', id)
  await logAdminAction({
    action: 'delete_property',
    entity_type: 'property',
    entity_id: id,
    entity_label: prop?.title ?? null,
  })
  revalidatePath('/admin/propiedades')
  revalidatePropertyPaths()
}

export async function bulkHideProperties(ids: string[]) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  await supabaseAdmin.from('properties').update({ hidden: true }).in('id', ids)
  revalidatePath('/admin/propiedades')
  revalidatePropertyPaths()
}

export async function bulkDeleteProperties(ids: string[]) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  const { data: targets } = await supabaseAdmin
    .from('properties')
    .select('id, title')
    .in('id', ids)
  await supabaseAdmin.from('properties').delete().in('id', ids)
  await logAdminAction({
    action: 'bulk_delete_properties',
    entity_type: 'property',
    entity_id: null,
    entity_label: `${ids.length} propiedades borradas en bulk`,
    metadata: {
      count: ids.length,
      items: targets?.map(t => ({ id: t.id, title: t.title })) ?? [],
    },
  })
  revalidatePath('/admin/propiedades')
  revalidatePropertyPaths()
}

export async function togglePropertySold(id: string, sold: boolean) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  const { data: prop } = await supabaseAdmin
    .from('properties').select('title').eq('id', id).maybeSingle()
  await supabaseAdmin.from('properties').update({ sold }).eq('id', id)
  await logAdminAction({
    action: 'toggle_sold',
    entity_type: 'property',
    entity_id: id,
    entity_label: prop?.title ?? null,
    metadata: { sold },
  })
  revalidatePath('/admin/propiedades')
  revalidatePropertyPaths()
}

export async function bulkMarkAsSold(ids: string[]) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  await supabaseAdmin.from('properties').update({ sold: true }).in('id', ids)
  await logAdminAction({
    action: 'bulk_mark_as_sold',
    entity_type: 'property',
    metadata: { count: ids.length },
  })
  revalidatePath('/admin/propiedades')
  revalidatePropertyPaths()
}

export async function updateFeaturedOrder(id: string, order: number) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  await supabaseAdmin.from('properties').update({ featured_order: order }).eq('id', id)
  revalidatePath('/admin/destacadas')
  revalidatePath('/')
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
    .replace(/[̀-ͯ]/g, '')
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

  const { data: created, error } = await supabaseAdmin.from('properties').insert({
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
  }).select('id').single()

  if (error) return { success: false, error: error.message }

  await logAdminAction({
    action: 'create_property',
    entity_type: 'property',
    entity_id: created?.id ?? null,
    entity_label: title,
    metadata: { slug },
  })
  revalidatePath('/admin/propiedades')
  revalidatePropertyPaths()
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
  const { data: lead } = await supabaseAdmin
    .from('leads').select('name, email').eq('id', id).maybeSingle()
  await supabaseAdmin.from('leads').delete().eq('id', id)
  await logAdminAction({
    action: 'delete_lead',
    entity_type: 'lead',
    entity_id: id,
    entity_label: lead ? `${lead.name} (${lead.email})` : null,
  })
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
  const { data: created } = await supabaseAdmin.from('blog_posts').insert(data).select('id').single()
  await logAdminAction({
    action: 'create_blog_post',
    entity_type: 'blog_post',
    entity_id: created?.id ?? null,
    entity_label: data.title,
  })
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
  await logAdminAction({
    action: 'update_blog_post',
    entity_type: 'blog_post',
    entity_id: id,
    entity_label: data.title ?? null,
    metadata: { fields_updated: Object.keys(data) },
  })
  revalidatePath('/admin/blog')
}

export async function deleteBlogPost(id: string) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  const { data: post } = await supabaseAdmin
    .from('blog_posts').select('title').eq('id', id).maybeSingle()
  await supabaseAdmin.from('blog_posts').delete().eq('id', id)
  await logAdminAction({
    action: 'delete_blog_post',
    entity_type: 'blog_post',
    entity_id: id,
    entity_label: post?.title ?? null,
  })
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
  const { data: created } = await supabaseAdmin.from('team_members').insert(data).select('id').single()
  await logAdminAction({
    action: 'create_team_member',
    entity_type: 'team_member',
    entity_id: created?.id ?? null,
    entity_label: data.name,
  })
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
  await logAdminAction({
    action: 'update_team_member',
    entity_type: 'team_member',
    entity_id: id,
    entity_label: data.name ?? null,
    metadata: { fields_updated: Object.keys(data) },
  })
  revalidatePath('/admin/equipo')
}

export async function deleteTeamMember(id: string) {
  try {
    await requireAdmin()
  } catch {
    throw new Error('No autorizado: requiere rol admin')
  }
  const { data: member } = await supabaseAdmin
    .from('team_members').select('name').eq('id', id).maybeSingle()
  await supabaseAdmin.from('team_members').delete().eq('id', id)
  await logAdminAction({
    action: 'delete_team_member',
    entity_type: 'team_member',
    entity_id: id,
    entity_label: member?.name ?? null,
  })
  revalidatePath('/admin/equipo')
}
