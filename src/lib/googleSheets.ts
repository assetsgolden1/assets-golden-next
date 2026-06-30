import { google } from 'googleapis'

// Columns for the Meta Leads sheet (11 columns, A:K)
// Fecha | Nombre | Email | Teléfono | Tipo | Presupuesto | Timeline | Purpose | Variante | Prioridad | Estado
interface MetaSheetRow {
  fecha: string
  nombre: string
  email: string
  telefono: string
  tipo_propiedad: string
  presupuesto: string
  timeline: string
  purpose: string
  variante: string
  prioridad: string
  estado: string
}

function buildSheetsClient(credentialsJson: string) {
  const credentials = JSON.parse(credentialsJson)
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}

export async function appendLeadToMetaSheet(lead: MetaSheetRow, spreadsheetId: string) {
  const credentialsJson = process.env.GOOGLE_SHEETS_CREDENTIALS_JSON
  if (!credentialsJson || !spreadsheetId) {
    throw new Error('[Sheets-Meta] GOOGLE_SHEETS_CREDENTIALS_JSON o spreadsheetId no configurados')
  }

  const sheets = buildSheetsClient(credentialsJson)

  const result = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "'LEADS'!A:K",
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [[
        lead.fecha,
        lead.nombre,
        lead.email,
        lead.telefono,
        lead.tipo_propiedad,
        lead.presupuesto,
        lead.timeline,
        lead.purpose,
        lead.variante,
        lead.prioridad,
        lead.estado,
      ]],
    },
  })

  console.log('[Sheets-Meta] Lead añadido:', lead.email, '— updatedRange:', result.data.updates?.updatedRange)
}

export async function readMetaSheetEmails(spreadsheetId: string): Promise<Set<string>> {
  const credentialsJson = process.env.GOOGLE_SHEETS_CREDENTIALS_JSON
  if (!credentialsJson || !spreadsheetId) return new Set()

  try {
    const sheets = buildSheetsClient(credentialsJson)
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "'LEADS'!C:C",
    })
    const rows = res.data.values ?? []
    // row[0] is the header "Email" — skip it
    return new Set(
      rows
        .slice(1)
        .map(r => (r[0] as string | undefined)?.toLowerCase().trim())
        .filter((e): e is string => !!e),
    )
  } catch (err) {
    console.error('[Sheets-Meta] Error leyendo emails existentes:', err)
    return new Set()
  }
}

// Lee la pestaña CRM (la que mantiene Atilio). Email=col C, Estado=col O.
// SOLO LECTURA. Devuelve filas crudas {email, estado}; la normalización/decisión
// de pausa vive en lib/leads/crmPause.ts. Lanza si no hay credenciales o si la
// API falla, para que el caller pueda ABORTAR la corrida (no enviar a ciegas).
export interface CrmStatusRow {
  email: string
  estado: string
}

export async function readCrmStatuses(spreadsheetId: string): Promise<CrmStatusRow[]> {
  const credentialsJson = process.env.GOOGLE_SHEETS_CREDENTIALS_JSON
  if (!credentialsJson) {
    throw new Error('[Sheets-CRM] GOOGLE_SHEETS_CREDENTIALS_JSON no configurado')
  }
  if (!spreadsheetId) {
    throw new Error('[Sheets-CRM] spreadsheetId no configurado')
  }

  const sheets = buildSheetsClient(credentialsJson)

  // Rango C:O → C[0]=Email ... O[12]=Estado dentro de cada fila del rango.
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'CRM'!C:O",
  })

  const rows = res.data.values ?? []
  // rows[0] es el header (Email / ... / Estado) — lo saltamos.
  return rows
    .slice(1)
    .map((r): CrmStatusRow => ({
      email: (r[0] as string | undefined) ?? '',
      estado: (r[12] as string | undefined) ?? '',
    }))
}

export async function appendLeadToSheets(lead: {
  name: string
  email: string
  phone?: string
  phone_country?: string
  phone_prefix?: string
  type?: string
  message?: string
  property_title?: string
  property_url?: string
  budget?: string
  source?: string
}) {
  try {
    console.log('[Sheets] Iniciando append...')
    const credentialsJson = process.env.GOOGLE_SHEETS_CREDENTIALS_JSON
    const sheetId = process.env.GOOGLE_SHEETS_LEADS_ID
    console.log('[Sheets] credentialsJson exists:', !!credentialsJson)
    console.log('[Sheets] credentialsJson length:', credentialsJson?.length)
    console.log('[Sheets] sheetId:', sheetId)

    if (!credentialsJson || !sheetId) {
      console.error('[Sheets] Missing env vars')
      return
    }

    const credentials = JSON.parse(credentialsJson)
    console.log('[Sheets] credentials parsed OK, client_email:', credentials.client_email)

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    const now = new Date()
    const fecha = now.toLocaleString('es-ES', {
      timeZone: 'Europe/Madrid',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const result = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "'Hoja 1'!A:L",
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          fecha,
          lead.name ?? '',
          lead.email ?? '',
          lead.phone_prefix ?? '',
          lead.phone ?? '',
          lead.phone_country ?? '',
          lead.type ?? '',
          lead.message ?? '',
          lead.property_title ?? '',
          lead.property_url ?? '',
          lead.budget ?? '',
          lead.source ?? 'web',
        ]],
      },
    })

    console.log('[Sheets] Lead añadido:', lead.email)
    console.log('[Sheets] append result:', JSON.stringify(result.data))
  } catch (error) {
    // No bloquear el flujo principal si Sheets falla
    console.error('[Sheets] Error:', error)
  }
}
