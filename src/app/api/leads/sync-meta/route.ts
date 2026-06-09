import { NextRequest, NextResponse } from 'next/server'
import { fetchLeadsFromMeta } from '@/lib/meta/leadsApi'
import { parseMetaLead } from '@/lib/meta/leadParser'
import { getSyncedLeadIds, getSyncedEmails, recordSyncedLeads } from '@/lib/meta/syncTracker'
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

  const formId = process.env.META_LEADS_FORM_ID ?? '1495878108643736'
  const sheetId = process.env.META_LEADS_SHEET_ID ?? '1Q_PRvDe45XxRoB43JZGWVJyJli8Cqf0G2Ry8vJcvZcA'
  const token = process.env.META_LEADS_SYNC_TOKEN

  if (!token) {
    return NextResponse.json(
      { ok: false, error: 'META_LEADS_SYNC_TOKEN no configurado' },
      { status: 500 },
    )
  }

  const runId = await createSyncRun(formId)

  try {
    // ── 1. Construir set de deduplicación ──────────────────────────────────
    const [syncedIds, syncedEmailsDb, sheetEmails] = await Promise.all([
      getSyncedLeadIds(formId),
      getSyncedEmails(formId),
      readMetaSheetEmails(sheetId),
    ])
    const knownEmails = new Set([...syncedEmailsDb, ...sheetEmails])

    // ── 2. Obtener leads desde Meta ────────────────────────────────────────
    const rawLeads = await fetchLeadsFromMeta(formId, token)
    console.log(`[sync-meta] ${rawLeads.length} lead(s) obtenidos de Meta (form ${formId})`)

    // ── 3. Filtrar duplicados ──────────────────────────────────────────────
    let duplicated = 0
    const batch: ReturnType<typeof parseMetaLead>[] = []

    for (const raw of rawLeads) {
      if (syncedIds.has(raw.id)) {
        duplicated++
        continue
      }
      const parsed = parseMetaLead(raw)
      if (parsed.email && knownEmails.has(parsed.email.toLowerCase())) {
        duplicated++
        continue
      }
      batch.push(parsed)
    }

    console.log(`[sync-meta] ${duplicated} duplicado(s), ${batch.length} nuevo(s) a cargar`)

    // ── 4. Append al Sheet + registrar en Supabase ─────────────────────────
    const synced: Array<{ meta_lead_id: string; email: string; created_time: string; form_id: string }> = []

    for (const parsed of batch) {
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

      synced.push({
        meta_lead_id: parsed.meta_lead_id,
        email: parsed.email,
        created_time: new Date().toISOString(),
        form_id: formId,
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
