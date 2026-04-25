import { google } from 'googleapis'

export async function appendLeadToSheets(lead: {
  name: string
  email: string
  phone?: string
  type?: string
  message?: string
  property_title?: string
  property_url?: string
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
      range: 'Hoja1!A:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          fecha,
          lead.name ?? '',
          lead.email ?? '',
          lead.phone ?? '',
          lead.type ?? '',
          lead.message ?? '',
          lead.property_title ?? '',
          lead.property_url ?? '',
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
