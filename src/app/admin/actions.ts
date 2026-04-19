'use server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// Propiedades
export async function toggleFeatured(id: string, featured: boolean) {
  await supabaseAdmin.from('properties').update({ featured }).eq('id', id)
  revalidatePath('/admin/propiedades')
  revalidatePath('/admin/destacadas')
}

export async function togglePropertyVisibility(id: string, hidden: boolean) {
  await supabaseAdmin.from('properties').update({ hidden }).eq('id', id)
  revalidatePath('/admin/propiedades')
  revalidatePath('/propiedades')
}

export async function deleteProperty(id: string) {
  await supabaseAdmin.from('properties').delete().eq('id', id)
  revalidatePath('/admin/propiedades')
  revalidatePath('/propiedades')
}

export async function bulkHideProperties(ids: string[]) {
  await supabaseAdmin.from('properties').update({ hidden: true }).in('id', ids)
  revalidatePath('/admin/propiedades')
  revalidatePath('/propiedades')
}

export async function bulkDeleteProperties(ids: string[]) {
  await supabaseAdmin.from('properties').delete().in('id', ids)
  revalidatePath('/admin/propiedades')
  revalidatePath('/propiedades')
}

export async function togglePropertySold(id: string, sold: boolean) {
  const update: Record<string, unknown> = { sold }
  if (sold) update.hidden = true
  await supabaseAdmin.from('properties').update(update).eq('id', id)
  revalidatePath('/admin/propiedades')
  revalidatePath('/propiedades')
}

export async function bulkMarkAsSold(ids: string[]) {
  await supabaseAdmin.from('properties').update({ sold: true, hidden: true }).in('id', ids)
  revalidatePath('/admin/propiedades')
  revalidatePath('/propiedades')
}

export async function updateFeaturedOrder(id: string, order: number) {
  await supabaseAdmin.from('properties').update({ featured_order: order }).eq('id', id)
  revalidatePath('/admin/destacadas')
}

// Leads
export async function updateLeadStatus(id: string, status: string) {
  await supabaseAdmin.from('leads').update({ status }).eq('id', id)
  revalidatePath('/admin/leads')
}

export async function deleteLead(id: string) {
  await supabaseAdmin.from('leads').delete().eq('id', id)
  revalidatePath('/admin/leads')
}

// Blog
export async function createBlogPost(data: {
  title: string; slug: string; category: string; excerpt: string;
  content: string; image_url: string; published: boolean; read_time: number
}) {
  await supabaseAdmin.from('blog_posts').insert(data)
  revalidatePath('/admin/blog')
}

export async function updateBlogPost(id: string, data: Partial<{
  title: string; slug: string; category: string; excerpt: string;
  content: string; image_url: string; published: boolean; read_time: number
}>) {
  await supabaseAdmin.from('blog_posts').update(data).eq('id', id)
  revalidatePath('/admin/blog')
}

export async function deleteBlogPost(id: string) {
  await supabaseAdmin.from('blog_posts').delete().eq('id', id)
  revalidatePath('/admin/blog')
}

export async function toggleBlogPublished(id: string, published: boolean) {
  await supabaseAdmin.from('blog_posts').update({ published }).eq('id', id)
  revalidatePath('/admin/blog')
}

// Equipo
export async function createTeamMember(data: {
  name: string; member_type: string; role_es: string; country: string;
  order_index: number; photo_url: string; linkedin_url: string; bio_es: string; active: boolean
}) {
  await supabaseAdmin.from('team_members').insert(data)
  revalidatePath('/admin/equipo')
}

export async function updateTeamMember(id: string, data: Partial<{
  name: string; member_type: string; role_es: string; country: string;
  order_index: number; photo_url: string; linkedin_url: string; bio_es: string; active: boolean
}>) {
  await supabaseAdmin.from('team_members').update(data).eq('id', id)
  revalidatePath('/admin/equipo')
}

export async function deleteTeamMember(id: string) {
  await supabaseAdmin.from('team_members').delete().eq('id', id)
  revalidatePath('/admin/equipo')
}
