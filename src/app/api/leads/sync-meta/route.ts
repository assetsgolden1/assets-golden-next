import { NextRequest, NextResponse } from 'next/server'
import { fetchLeadsFromMeta, type MetaLeadRaw } from '@/lib/meta/leadsApi'
import { parseMetaLead } from '@/lib/meta/leadParser'
import { getFormIds } from '@/lib/meta/formIds'
import { getSyncedLeadIds, getSyncedEmails, recordSyncedLeads, upsertMetaLead } from '@/lib/meta/syncTracker'
import { createSyncRun, updateSyncRun } from '@/lib/meta/syncLog'
import { appendLeadToMetaSheet, readMetaSheetEmails } from '@/lib/googleSheets'
import { categorizeLead, getSpecialStateNotes } from '@/lib/leads/prioritizeLead'
import { sendWelcomeEmail } from '@/lib/email/sendWelcomeEmail'

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.META_LEADS_CRON_SECRET
  if (!secret) return true
  return req.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formIds = getFormIds()
  const sheetId = process.env.META_LEADS_SHEET_ID ?? '1Q_PRvDe45XxRoB43JZGWVJyJli8Cqf0G2Ry8vJcvZcA'
  const token = process.env.META_LEADS_SYNC_TOKEN

  if (!token) {
    return NextResponse.json(
      { ok: false, error: 'META_LEADS_SYNC_TOKEN no configurado' },
      { status: 500 },
    )
  }

  const runId = await createSyncRun(formIds.join(','))

  try {
    // ── 1. Construir set de deduplicación (unión de todos los forms) ───────
    const [syncedIds, syncedEmailsDb, sheetEmails] = await Promise.all([
      getSyncedLeadIds(formIds),
      getSyncedEmails(formIds),
      readMetaSheetEmails(sheetId),
    ])
    const knownEmails = new Set([...syncedEmailsDb, ...sheetEmails])

    // ── 2. Obtener leads desde Meta (cada form, etiquetando su origen) ─────
    const rawLeads: Array<{ raw: MetaLeadRaw; formId: string }> = []
    for (const formId of formIds) {
      const leads = await fetchLeadsFromMeta(formId, token)
      console.log(`[sync-meta] ${leads.length} lead(s) obtenidos de Meta (form ${formId})`)
      for (const raw of leads) rawLeads.push({ raw, formId })
    }

    // ── 3. Filtrar duplicados (DB + Sheet + dentro del mismo batch) ────────
    let duplicated = 0
    const batch: Array<{ parsed: ReturnType<typeof parseMetaLead>; formId: string }> = []
    const seenIds = new Set<string>()

    for (const { raw, formId } of rawLeads) {
      if (seenIds.has(raw.id) || syncedIds.has(raw.id)) {
        duplicated++
        continue
      }
      const parsed = parseMetaLead(raw)
      const emailKey = parsed.email?.toLowerCase()
      if (emailKey && knownEmails.has(emailKey)) {
        duplicated++
        continue
      }
      seenIds.add(raw.id)
      if (emailKey) knownEmails.add(emailKey)
      batch.push({ parsed, formId })
    }

    console.log(`[sync-meta] ${duplicated} duplicado(s), ${batch.length} nuevo(s) a cargar`)

    // ── 4. Append al Sheet + registrar en Supabase ─────────────────────────
    const synced: Array<{ meta_lead_id: string; email: string; created_time: string; form_id: string }> = []

    for (const { parsed, formId } of batch) {
      const prioridad = categorizeLead({
        email: parsed.email,
        telefono: parsed.telefono,
        tipo_propiedad: parsed.tipo_propiedad,
        presupuesto: parsed.presupuesto,
        timeline: parsed.timeline,
        purpose: parsed.purpose,
      })
      const estado = getSpecialStateNotes({
        email: parsed.email,
        telefono: parsed.telefono,
        tipo_propiedad: parsed.tipo_propiedad,
        presupuesto: parsed.presupuesto,
        timeline: parsed.timeline,
        purpose: parsed.purpose,
      }) ?? ''

      await appendLeadToMetaSheet(
        {
          fecha: parsed.fecha,
          nombre: parsed.nombre,
          email: parsed.email,
          telefono: parsed.telefono,
          tipo_propiedad: parsed.tipo_propiedad,
          presupuesto: parsed.presupuesto,
          timeline: parsed.timeline,
          purpose: parsed.purpose,
          variante: parsed.variante,
          prioridad,
          estado,
        },
        sheetId,
      )

      // Persistir en meta_leads (base de la secuencia). Adicional al Sheet.
      await upsertMetaLead(parsed)

      synced.push({
        meta_lead_id: parsed.meta_lead_id,
        email: parsed.email,
        created_time: parsed.created_time, // timestamp REAL del lead en Meta (no el del sync)
        form_id: formId, // form_id REAL del lead, no el hardcodeado
      })

      await sendWelcomeEmail(parsed.email, parsed.nombre)
    }

    if (synced.length > 0) {
      await recordSyncedLeads(synced)
    }

    // ── 5. Actualizar log ──────────────────────────────────────────────────
    if (runId) {
      await updateSyncRun(runId, {
        status: 'ok',
        leads_fetched: rawLeads.length,
        leads_duplicated: duplicated,
        leads_added: synced.length,
      })
    }

    return NextResponse.json({
      ok: true,
      fetched: rawLeads.length,
      duplicated,
      added: synced.length,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[sync-meta] Error fatal:', msg)

    if (runId) {
      await updateSyncRun(runId, { status: 'error', error_message: msg }).catch(() => {})
    }

    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
