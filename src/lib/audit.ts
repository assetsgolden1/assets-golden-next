import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export type AuditAction =
  | 'delete_property'        | 'update_property'        | 'create_property'
  | 'bulk_delete_properties' | 'toggle_featured'         | 'toggle_hidden'
  | 'toggle_sold'            | 'bulk_mark_as_sold'
  | 'create_agent'           | 'update_agent'            | 'delete_agent'
  | 'toggle_agent'           | 'send_password_reset'
  | 'create_blog_post'       | 'update_blog_post'        | 'delete_blog_post'
  | 'create_team_member'     | 'update_team_member'      | 'delete_team_member'
  | 'delete_lead'             | 'update_lead'
  | 'sync_habihub_manual'
  | 'create_destination'     | 'update_destination'

export type AuditEntity =
  | 'property' | 'agent' | 'lead' | 'blog_post' | 'team_member' | 'sync' | 'destination'

export type AuditInput = {
  action:        AuditAction
  entity_type:   AuditEntity
  entity_id?:    string | null
  entity_label?: string | null
  metadata?:     Record<string, unknown> | null
  // Si el caller ya tiene el user (evita segundo getUser())
  actor?:        { id: string; email: string | null }
}

// Best-effort: nunca rompe la operación principal si falla.
export async function logAdminAction(input: AuditInput): Promise<void> {
  try {
    const headersList = await headers()
    const ipAddress =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      headersList.get('x-real-ip') ??
      null
    const userAgent = headersList.get('user-agent') ?? null

    let actorId: string | null = null
    let actorEmail: string | null = null

    if (input.actor) {
      actorId    = input.actor.id
      actorEmail = input.actor.email
    } else {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      actorId    = user?.id    ?? null
      actorEmail = user?.email ?? null
    }

    await supabaseAdmin.from('admin_audit_log').insert({
      actor_user_id: actorId,
      actor_email:   actorEmail,
      action:        input.action,
      entity_type:   input.entity_type,
      entity_id:     input.entity_id    ?? null,
      entity_label:  input.entity_label ?? null,
      metadata:      input.metadata     ?? null,
      ip_address:    ipAddress,
      user_agent:    userAgent,
    })
  } catch (error) {
    console.error('[audit] error logueando acción:', error)
  }
}
