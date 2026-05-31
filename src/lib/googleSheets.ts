import { google } from 'googleapis'

// Columns for the Meta Leads sheet (10 columns, A:J)
interface MetaLead {
  fecha: string
  nombre: string
  email: string
  telefono: string
  tipo_propiedad: string
  presupuesto: string
  timeline: string
  purpose: string
  variante: string
  estado: string
}

export async function appendLeadToMetaSheet(lead: MetaLead, spreadsheetId: string) {
  const credentialsJson = process.env.GOOGLE_SHEETS_CREDENTIALS_JSON
  if (!credentialsJson || !spreadsheetId) {
    throw new Error('[Sheets-Meta] GOOGLE_SHEETS_CREDENTIALS_JSON o spreadsheetId no configurados')
  }

  const credentials = JSON.parse(credentialsJson)
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })

  const result = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "'Hoja 1'!A:J",
    valueInputOption: 'USER_ENTERED',
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
        lead.estado,
      ]],
    },
  })

  console.log('[Sheets-Meta] Lead añadido:', lead.email, '— updatedRange:', result.data.updates?.updatedRange)
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
