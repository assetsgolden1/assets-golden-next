import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { SEQUENCE_TEMPLATES, type SequenceLead } from '@/lib/email/sequenceTemplates'
import { sendSequenceEmail } from '@/lib/email/sendSequenceEmail'

// Cron de la secuencia de nurture (LEADS-SEQ-P03).
// GET protegido con el mismo secret que el sync de leads (META_LEADS_CRON_SECRET).
// Para cada lead en meta_leads con seq_paused=false, envía SOLO el próximo correo
// pendiente que corresponda por umbral de días desde created_time (máx 1 por corrida).
// Idempotente: si seq_emailN_sent_at ya tiene fecha, no reenvía.

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.META_LEADS_CRON_SECRET
  if (!secret) return true
  return req.headers.get('authorization') === `Bearer ${secret}`
}

// Umbrales en días desde created_time + columna de marca por email.
const STEPS = [
  { n: 1, days: 3, col: 'seq_email1_sent_at' },
  { n: 2, days: 8, col: 'seq_email2_sent_at' },
  { n: 3, days: 15, col: 'seq_email3_sent_at' },
  { n: 4, days: 22, col: 'seq_email4_sent_at' },
  { n: 5, days: 60, col: 'seq_email5_sent_at' },
] as const

const MS_PER_DAY = 1000 * 60 * 60 * 24

interface MetaLeadRow {
  id: string
  email: string | null
  nombre: string | null
  presupuesto_raw: string | null
  tipo_propiedad: string | null
  purpose: string | null
  created_time: string | null
  seq_paused: boolean
  seq_email1_sent_at: string | null
  seq_email2_sent_at: string | null
  seq_email3_sent_at: string | null
  seq_email4_sent_at: string | null
  seq_email5_sent_at: string | null
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = Date.now()

  const { data, error } = await supabaseAdmin
    .from('meta_leads')
    .select(
      'id, email, nombre, presupuesto_raw, tipo_propiedad, purpose, created_time, seq_paused, seq_email1_sent_at, seq_email2_sent_at, seq_email3_sent_at, seq_email4_sent_at, seq_email5_sent_at',
    )
    .eq('seq_paused', false)

  if (error) {
    console.error('[sequence] Error leyendo meta_leads:', error.message)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  const leads = (data ?? []) as MetaLeadRow[]

  let scanned = 0
  let sent = 0
  let skippedNoEmail = 0
  let skippedNoCreatedTime = 0
  let failed = 0
  const sentByEmail: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  const details: Array<{ id: string; email: string; emailNumber: number }> = []

  for (const lead of leads) {
    scanned++

    if (!lead.email) {
      skippedNoEmail++
      continue
    }
    if (!lead.created_time) {
      skippedNoCreatedTime++
      continue
    }

    const dias = Math.floor((now - new Date(lead.created_time).getTime()) / MS_PER_DAY)

    // Próximo pendiente respetando el orden: el primer email aún no enviado.
    const nextStep = STEPS.find((s) => !lead[s.col])
    if (!nextStep) continue // todos enviados

    // Solo si su umbral de días ya se cumplió. Si no, no saltamos al siguiente.
    if (dias < nextStep.days) continue

    const sequenceLead: SequenceLead = {
      nombre: lead.nombre,
      presupuesto_raw: lead.presupuesto_raw,
      tipo_propiedad: lead.tipo_propiedad,
      purpose: lead.purpose,
    }

    const content = SEQUENCE_TEMPLATES[nextStep.n](sequenceLead)
    const ok = await sendSequenceEmail(lead.email, content)

    if (!ok) {
      failed++
      continue
    }

    const { error: updateError } = await supabaseAdmin
      .from('meta_leads')
      .update({ [nextStep.col]: new Date().toISOString() })
      .eq('id', lead.id)

    if (updateError) {
      // El correo salió pero no pudimos marcarlo: log fuerte para evitar reenvíos ciegos.
      console.error(
        `[sequence] CRÍTICO: email ${nextStep.n} enviado a ${lead.email} pero falló el UPDATE de ${nextStep.col} (lead ${lead.id}):`,
        updateError.message,
      )
      failed++
      continue
    }

    sent++
    sentByEmail[nextStep.n]++
    details.push({ id: lead.id, email: lead.email, emailNumber: nextStep.n })
  }

  return NextResponse.json({
    ok: true,
    scanned,
    sent,
    sentByEmail,
    failed,
    skippedNoEmail,
    skippedNoCreatedTime,
    details,
  })
}
