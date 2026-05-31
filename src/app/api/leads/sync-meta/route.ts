import { NextRequest, NextResponse } from 'next/server'
import { fetchLeadsFromMeta } from '@/lib/meta/leadsApi'
import { parseMetaLead } from '@/lib/meta/leadParser'
import { getLastSyncedTimestamp, recordSync } from '@/lib/meta/syncTracker'
import { appendLeadToMetaSheet } from '@/lib/googleSheets'

// Vercel injects Authorization: Bearer {CRON_SECRET} on every cron invocation.
// Set CRON_SECRET in Vercel env vars to protect manual calls too.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true // no secret configured → open (dev only)
  const header = req.headers.get('authorization')
  return header === `Bearer ${secret}`
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formId = process.env.META_LEAD_FORM_ID
  const sheetId = process.env.META_LEADS_SHEET_ID

  if (!formId || !sheetId) {
    console.error('[sync-meta] META_LEAD_FORM_ID o META_LEADS_SHEET_ID no configurados')
    return NextResponse.json(
      { ok: false, error: 'Variables de entorno META_LEAD_FORM_ID / META_LEADS_SHEET_ID no configuradas' },
      { status: 500 },
    )
  }

  try {
    const sinceTimestamp = await getLastSyncedTimestamp(formId)
    console.log(
      `[sync-meta] Buscando leads desde ${new Date(sinceTimestamp * 1000).toISOString()} (form ${formId})`,
    )

    const rawLeads = await fetchLeadsFromMeta(formId, sinceTimestamp)
    console.log(`[sync-meta] ${rawLeads.length} lead(s) nuevos encontrados`)

    let appended = 0
    const errors: string[] = []

    for (const raw of rawLeads) {
      try {
        const parsed = parseMetaLead(raw)
        await appendLeadToMetaSheet(parsed, sheetId)
        console.log(`[sync-meta] Lead procesado: ${parsed.email || raw.id}`)
        appended++
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        console.error(`[sync-meta] Error procesando lead ${raw.id}: ${msg}`)
        errors.push(`lead_id=${raw.id}: ${msg}`)
      }
    }

    await recordSync(
      formId,
      appended,
      errors.length === 0 ? 'ok' : 'error',
      errors.length > 0 ? { errors } : undefined,
    )

    return NextResponse.json({
      ok: true,
      leadsFound: rawLeads.length,
      leadsProcessed: appended,
      errors: errors.length > 0 ? errors : null,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[sync-meta] Error fatal:', msg)

    // Best-effort: log the failure, ignore secondary errors
    await recordSync(formId, 0, 'error', { error: msg }).catch(() => {})

    return NextResponse.json({ ok: false, error: msg, leadsProcessed: 0 }, { status: 500 })
  }
}
